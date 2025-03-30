// lib/hooks/useSupabaseChat.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MessageStatus } from '@/lib/types/socket';
import { useLocalStorage } from './useLocalStorage';
import { trpc } from '@/lib/trpc/client';
import { v4 as uuidv4 } from 'uuid';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { MessageType } from '@/lib/types/enum';

// 定义消息接口
interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content?: string;
  postId?: string;
  messageType: string;
  createdAt: Date;
  status: MessageStatus;
  isTemporary?: boolean;
  retryCount?: number;
  errorMessage?: string;
}

export function useSupabaseChat(userId: string, chatRoomId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  // 使用本地存储保存待发送消息
  const [pendingMessages, setPendingMessages] = useLocalStorage<ChatMessage[]>(
    `pending_messages_${userId}`, 
    []
  );
  
  // trpc工具
  const utils = trpc.useUtils();
  
  // Supabase客户端
  const supabase = createClientComponentClient();
  
  // Supabase实时频道引用
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  
  // 初始化Supabase
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;
    
    supabaseRef.current = supabase;
    setIsConnected(true);
    setError(null);
    
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [userId, supabase]);
  
  // 订阅聊天室变更
  useEffect(() => {
    if (!chatRoomId || !supabaseRef.current || !isConnected) return;
    
    // 如果已有通道，先取消订阅
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    
    try {
      // 创建聊天室频道
      const channel = supabaseRef.current.channel(`chat:${chatRoomId}`)
        // 监听新消息
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        }, payload => {
          console.log('New message received:', payload);
          
          // 刷新消息列表
          utils.chat.getMessages.invalidate({ chatRoomId });
          
          // 如果有临时ID，移除本地待确认消息
          const newMsg = payload.new as any;
          if (newMsg.temporary_id) {
            setPendingMessages(prev => 
              prev.filter(m => m.id !== newMsg.temporary_id)
            );
          }
        })
        
        // 监听消息更新（如状态变更）
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        }, payload => {
          console.log('Message updated:', payload);
          utils.chat.getMessages.invalidate({ chatRoomId });
        })
        
        // 监听消息已读
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'message_read_by'
        }, payload => {
          console.log('Message read:', payload);
          utils.chat.getMessages.invalidate({ chatRoomId });
        })
        
        // 监听聊天室参与者状态更新
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chat_room_participants',
          filter: `chat_room_id=eq.${chatRoomId}`
        }, payload => {
          console.log('Participant status updated:', payload);
        })
        
        // 使用广播消息实现"正在输入"状态
        .on('broadcast', { event: 'typing' }, payload => {
          if (payload.userId !== userId) {
            setOtherUserTyping(!!payload.isTyping);
            
            // 5秒后自动清除"正在输入"状态
            if (payload.isTyping) {
              setTimeout(() => {
                setOtherUserTyping(false);
              }, 5000);
            }
          }
        })
        
        .subscribe(status => {
          if (status === 'SUBSCRIBED') {
            console.log('Connected to chat room channel:', chatRoomId);
            setIsConnected(true);
            
            // 告知服务器用户已加入聊天室
            trpc.chat.joinChatRoom.mutate({
              chatRoomId,
              userId
            }).catch(err => {
              console.error('Failed to notify join chat room:', err);
            });
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error connecting to chat room channel:', chatRoomId);
            setError(new Error('Failed to connect to chat room'));
            setIsConnected(false);
          }
        });
      
      channelRef.current = channel;
      
      // 定期发送心跳以保持连接
      const heartbeatInterval = setInterval(() => {
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'heartbeat',
            payload: { userId }
          });
        }
      }, 30000); // 每30秒发送一次心跳
      
      // 清理函数
      return () => {
        clearInterval(heartbeatInterval);
        
        if (channelRef.current) {
          channelRef.current.unsubscribe();
          channelRef.current = null;
        }
        
        // 告知服务器用户已离开聊天室
        if (userId && chatRoomId) {
          trpc.chat.leaveChatRoom.mutate({
            chatRoomId,
            userId
          }).catch(err => {
            console.error('Failed to notify leave chat room:', err);
          });
        }
      };
    } catch (err) {
      console.error('Error setting up Supabase chat:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup chat'));
      setIsConnected(false);
    }
  }, [chatRoomId, isConnected, userId, utils.chat.getMessages, setPendingMessages, supabase]);
  
  // 处理待发送消息
  const handlePendingMessages = useCallback(() => {
    if (!isConnected || pendingMessages.length === 0) return;
    
    // 遍历并重新发送所有待发送消息
    const pendingMessagesCopy = [...pendingMessages]; // 创建副本避免直接操作state
    
    pendingMessagesCopy.forEach(message => {
      // 通过trpc发送消息
      trpc.chat.sendMessage.mutate({
        id: message.id, // 临时ID
        chatRoomId: message.chatRoomId,
        content: message.content,
        postId: message.postId,
        messageType: message.messageType,
      }).then(() => {
        // 发送成功后，从队列中移除
        // 注意: 实际消息将通过Supabase实时更新接收
        setPendingMessages(prev => prev.filter(m => m.id !== message.id));
      }).catch(error => {
        console.error('Failed to send message:', error);
        // 更新消息状态为失败
        setPendingMessages(prev => prev.map(m => 
          m.id === message.id 
            ? { ...m, status: MessageStatus.FAILED, errorMessage: error.message } 
            : m
        ));
      });
    });
  }, [isConnected, pendingMessages, setPendingMessages]);
  
  // 处理待发送消息的useEffect
  useEffect(() => {
    if (isConnected && pendingMessages.length > 0) {
      handlePendingMessages();
    }
  }, [isConnected, pendingMessages, handlePendingMessages]);
  
  // 发送消息
  const sendMessage = useCallback((params: {
    chatRoomId: string;
    content?: string;
    postId?: string;
    messageType:string;
  }) => {
    if (!userId) {
      return { success: false, error: 'User not logged in' };
    }
    
    const { chatRoomId, content, postId, messageType } = params;
    const temporaryId = uuidv4();
    const now = new Date();
    
    // 创建新消息对象
    const newMessage: ChatMessage = {
      id: temporaryId,
      chatRoomId,
      senderId: userId,
      content,
      postId,
      messageType,
      createdAt: now,
      status: MessageStatus.SENDING,
      isTemporary: true,
    };
    
    // 如果没有连接，添加到待发送队列
    if (!isConnected) {
      setPendingMessages(prev => [...prev, newMessage]);
      return { success: false, message: newMessage, error: 'No network connection, message will be sent later' };
    }
    
    // 添加到本地待确认队列
    setPendingMessages(prev => [...prev, newMessage]);
    
    // 通过trpc发送消息
    trpc.chat.sendMessage.mutate({
      id: temporaryId,
      chatRoomId,
      content,
      postId,
      messageType,
    }).catch(error => {
      console.error('Failed to send message:', error);
      // 更新消息状态为失败
      setPendingMessages(prev => prev.map(m => 
        m.id === temporaryId 
          ? { ...m, status: MessageStatus.FAILED, errorMessage: error.message } 
          : m
      ));
    });
    
    return { success: true, message: newMessage };
  }, [isConnected, userId, setPendingMessages]);
  
  // 重发消息
  const retryMessage = useCallback((messageId: string) => {
    const messageToRetry = pendingMessages.find(m => m.id === messageId);
    if (!messageToRetry) return false;
    
    // 更新重试次数
    const updatedMessage = {
      ...messageToRetry,
      retryCount: (messageToRetry.retryCount || 0) + 1,
      status: MessageStatus.SENDING,
    };
    
    // 从待发送队列中移除旧消息
    setPendingMessages(prev => prev.filter(m => m.id !== messageId));
    
    // 添加回待确认队列
    setPendingMessages(prev => [...prev, updatedMessage]);
    
    // 通过trpc重发消息
    trpc.chat.sendMessage.mutate({
      id: messageToRetry.id,
      chatRoomId: messageToRetry.chatRoomId,
      content: messageToRetry.content,
      postId: messageToRetry.postId,
      messageType: messageToRetry.messageType,
    }).catch(error => {
      console.error('Failed to retry message:', error);
      // 更新消息状态为失败
      setPendingMessages(prev => prev.map(m => 
        m.id === messageToRetry.id 
          ? { ...m, status: MessageStatus.FAILED, errorMessage: error.message } 
          : m
      ));
    });
    
    return true;
  }, [pendingMessages, setPendingMessages]);
  
  // 标记消息为已读
  const markMessageAsRead = useCallback((messageId: string) => {
    if (!isConnected || !userId) return;
    
    // 通过trpc标记消息为已读
    trpc.chat.markMessageAsRead.mutate({
      messageId,
      userId
    }).catch(error => {
      console.error('Failed to mark message as read:', error);
    });
  }, [isConnected, userId]);
  
  // 设置正在输入状态
  const setTypingStatus = useCallback((isTyping: boolean) => {
    if (!isConnected || !chatRoomId || !userId || !channelRef.current) return;
    
    // 使用Supabase广播发送正在输入状态
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId,
        isTyping,
        chatRoomId
      }
    }).catch(error => {
      console.error('Failed to send typing status:', error);
    });
  }, [isConnected, chatRoomId, userId]);
  
  // 返回状态和方法
  return {
    isConnected,
    isReconnecting,
    error,
    pendingMessages,
    otherUserTyping,
    sendMessage,
    retryMessage,
    markMessageAsRead,
    setTypingStatus,
  };
}