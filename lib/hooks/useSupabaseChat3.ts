// lib/hooks/useSupabaseChat.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MessageStatus,MessageType } from '@/lib/types/enum';
import { useLocalStorage } from './useLocalStorage';
import { trpc } from '@/lib/trpc/client';
import { v4 as uuidv4 } from 'uuid';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

// 定义消息接口
interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content?: string;
  postId?: string;
  messageType:keyof typeof MessageType;
  createdAt: Date;
  status: MessageStatus;
  isTemporary?: boolean;
  retryCount?: number;
  errorMessage?: string;
}

// 数据库消息结构
interface DatabaseMessage {
  id: string;
  chat_room_id: string;
  sender_id?: string;
  content?: string;
  post_id?: string;
  message_type: string;
  status?: string;
  created_at?: string;
  temporary_id?: string;
}

export function useSupabaseChat2(userId: string, chatRoomId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  // 跟踪用户离开聊天室和发送消息的状态
  const hasJoinedChatRoom = useRef(false);
  const hasLeftChatRoom = useRef(false);
  const sentMessagesRef = useRef(new Set<string>());
  
  // 保存当前聊天室ID的引用，用于检测变化
  const currentChatRoomIdRef = useRef<string | undefined>(chatRoomId);

  // 使用本地存储保存待发送消息
  const [pendingMessages, setPendingMessages] = useLocalStorage<ChatMessage[]>(
    `pending_messages_${userId}`, 
    []
  );
  
  // trpc工具
  const utils = trpc.useUtils();
  
  // TRPC mutations
  const joinChatRoom = trpc.chat.joinChatRoom.useMutation();
  const leaveChatRoom = trpc.chat.leaveChatRoom.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const markMessageReadMutation = trpc.chat.markMessageRead.useMutation();
  const setTypingStatusMutation = trpc.chat.setTypingStatus.useMutation();
  
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
  
  // 检测聊天室变化，重置状态
  useEffect(() => {
    // 如果聊天室ID变化，重置状态
    if (chatRoomId !== currentChatRoomIdRef.current) {
      hasJoinedChatRoom.current = false;
      hasLeftChatRoom.current = false;
      currentChatRoomIdRef.current = chatRoomId;
      
      // 如果之前有聊天室，通知离开
      if (currentChatRoomIdRef.current && userId) {
        leaveChatRoom.mutate({
          chatRoomId: currentChatRoomIdRef.current,
          userId
        });
      }
    }
  }, [chatRoomId, userId, leaveChatRoom]);
  
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
          console.log('🔔🔔🔔 REALTIME MESSAGE RECEIVED:', payload);
          console.log('Message content:', payload.new?.content);
          console.log('Timestamp:', new Date().toISOString());
          
          // 刷新消息列表
          utils.chat.getMessages.invalidate({ chatRoomId });
          
          // 如果有临时ID，移除本地待确认消息
          const newMsg = payload.new as DatabaseMessage;
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
          // const participantData = payload.new as Record<string, any>;
          
          // 如果是其他用户的打字状态变更
          // if (participantData.user_id !== userId && participantData.is_typing !== undefined) {
          //   setOtherUserTyping(!!participantData.is_typing);
            
          //   // 5秒后自动清除"正在输入"状态
          //   if (participantData.is_typing) {
          //     setTimeout(() => {
          //       setOtherUserTyping(false);
          //     }, 5000);
          //   }
          // }
        })
        
        // 使用广播消息实现心跳检测
        .on('broadcast', { event: 'heartbeat' }, payload => {
          console.log('Heartbeat received:', payload);
        })
        
        .subscribe(status => {
          if (status === 'SUBSCRIBED') {
            console.log('Connected to chat room channel:', chatRoomId);
            setIsConnected(true);
            
            // 仅在首次连接或聊天室变更时加入聊天室
            if (!hasJoinedChatRoom.current && userId && chatRoomId) {
              console.log('Joining chat room for the first time:', chatRoomId);
              hasJoinedChatRoom.current = true; // 标记为已加入
              hasLeftChatRoom.current = false;  // 重置离开标记
              
              joinChatRoom.mutate({
                chatRoomId,
                userId
              }, {
                onError: (error) => {
                  console.error('Failed to notify join chat room:', error);
                  // 如果失败，重置状态以便能够重试
                  hasJoinedChatRoom.current = false;
                }
              });
            }
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
        
        // 仅在组件真正卸载时发送离开通知，而不是每次effect重新运行时
        if (userId && chatRoomId && !hasLeftChatRoom.current) {
          console.log('Leaving chat room:', chatRoomId);
          hasLeftChatRoom.current = true;
          
          leaveChatRoom.mutate({
            chatRoomId,
            userId
          }, {
            onError: (error) => {
              console.error('Failed to notify leave chat room:', error);
              // 如果失败，重置状态以便能够重试
              hasLeftChatRoom.current = false;
            }
          });
        }
      };
    } catch (err) {
      console.error('Error setting up Supabase chat:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup chat'));
      setIsConnected(false);
    }
  }, [chatRoomId, isConnected, userId, utils.chat.getMessages, setPendingMessages, supabase, joinChatRoom, leaveChatRoom]);
  
  // 处理待发送消息
  const handlePendingMessages = useCallback(() => {
    if (!isConnected || pendingMessages.length === 0) return;
    
    // 遍历并重新发送所有待发送消息
    const pendingMessagesCopy = [...pendingMessages]; // 创建副本避免直接操作state
    
    pendingMessagesCopy.forEach(message => {
      // 通过trpc发送消息
      sendMessageMutation.mutate({
        temporaryId: message.id, // 临时ID
        chatRoomId: message.chatRoomId,
        content: message.content,
        postId: message.postId,
        messageType: message.messageType
      }, {
        onSuccess: () => {
          // 发送成功后，从队列中移除
          // 注意: 实际消息将通过Supabase实时更新接收
          setPendingMessages(prev => prev.filter(m => m.id !== message.id));
        },
        onError: (error) => {
          console.error('Failed to send message:', error);
          // 更新消息状态为失败
          setPendingMessages(prev => prev.map(m => 
            m.id === message.id 
              ? { ...m, status: MessageStatus.FAILED, errorMessage: error.message } 
              : m
          ));
        }
      });
    });
  }, [isConnected, pendingMessages, setPendingMessages, sendMessageMutation]);
  
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
    messageType: keyof typeof MessageType;
  }) => {
    if (!userId) {
      return { success: false, error: 'User not logged in' };
    }

    // 防止重复发送
    const messageKey = `${params.chatRoomId}_${Date.now()}`;
    if (sentMessagesRef.current.has(messageKey)) {
      console.warn('Preventing duplicate message send');
      return { success: false, error: 'Duplicate send prevented' };
    }
    sentMessagesRef.current.add(messageKey);
    // 设置一个超时，从集合中移除这个key
    setTimeout(() => {
      sentMessagesRef.current.delete(messageKey);
    }, 10000);
    
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
    
    // 先乐观更新本地UI
    setPendingMessages(prev => [...prev, newMessage]);
    
    // 如果没有连接，只保存在本地队列
    if (!isConnected) {
      return { 
        success: false, 
        message: newMessage, 
        error: 'No network connection, message will be sent later' 
      };
    }
    
    // 通过trpc发送消息
    sendMessageMutation.mutate({
      temporaryId,
      chatRoomId,
      content,
      postId,
      messageType
    }, {
      onError: (error) => {
        console.error('Failed to send message:', error);
        // 更新消息状态为失败
        setPendingMessages(prev => prev.map(m => 
          m.id === temporaryId 
            ? { ...m, status: MessageStatus.FAILED, errorMessage: error.message } 
            : m
        ));
      }
    });
    
    return { success: true, message: newMessage };
  }, [isConnected, userId, setPendingMessages, sendMessageMutation]);
  
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
    sendMessageMutation.mutate({
      temporaryId: messageToRetry.id,
      chatRoomId: messageToRetry.chatRoomId,
      content: messageToRetry.content,
      postId: messageToRetry.postId,
      messageType: messageToRetry.messageType,
    }, {
      onError: (error) => {
        console.error('Failed to retry message:', error);
        // 更新消息状态为失败
        setPendingMessages(prev => prev.map(m => 
          m.id === messageToRetry.id 
            ? { ...m, status: MessageStatus.FAILED, errorMessage: error.message } 
            : m
        ));
      }
    });
    
    return true;
  }, [pendingMessages, setPendingMessages, sendMessageMutation]);
  
  // 标记消息为已读
  const markMessageAsRead = useCallback((messageId: string) => {
    if (!isConnected || !userId) return;
    
    // 通过trpc标记消息为已读
    markMessageReadMutation.mutate({
      messageId,
      userId
    }, {
      onError: (error) => {
        console.error('Failed to mark message as read:', error);
      }
    });
  }, [isConnected, userId, markMessageReadMutation]);
  
  // 设置正在输入状态
  const setTypingStatus = useCallback((isTyping: boolean) => {
    if (!isConnected || !chatRoomId || !userId) return;
    
    // 通过TRPC更新正在输入状态
    // Supabase将自动触发realtime事件通知其他用户
    setTypingStatusMutation.mutate({
      chatRoomId,
      userId,
      isTyping
    }, {
      onError: (error) => {
        console.error('Failed to send typing status:', error);
      }
    });
  }, [isConnected, chatRoomId, userId, setTypingStatusMutation]);
  
  // 网络重连处理
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      if (!isConnected) {
        setIsReconnecting(true);
        // 重新初始化Supabase
        supabaseRef.current = supabase;
        setIsConnected(true);
        setError(null);
        setIsReconnecting(false);
      }
    };
    
    const handleOffline = () => {
      console.log('Network connection lost');
      setIsConnected(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, supabase]);
  
  // 返回状态和方法
  return {
    isConnected,
    isReconnecting,
    error,
    pendingMessages,
    // otherUserTyping,
    sendMessage,
    retryMessage,
    markMessageAsRead,
    setTypingStatus,
  };
}