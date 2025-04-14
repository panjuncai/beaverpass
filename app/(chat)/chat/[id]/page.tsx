'use client';
import { useEffect, useState, useRef, useCallback, KeyboardEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useAuthStore } from '@/lib/store/auth-store';
import {Button, Image, Skeleton, TextArea } from 'antd-mobile';
import { MessageStatus, MessageType } from '@/lib/types/enum';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useSupabaseChat } from '@/lib/hooks/useSupabaseChat';
export default function ChatDetailPage() {
  const router = useRouter();
  const { id: chatRoomId } = useParams<{ id: string }>();
  const { loginUser } = useAuthStore();
  const [message, setMessage] = useState('');
  // const [isTyping, setIsTyping] = useState(false);
  // const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 在组件顶部定义ref
  // const markedMessageIdsRef = useRef(new Set<string>());
  
  // 如果没有登录，重定向到登录页
  useEffect(() => {
    if (!loginUser) {
      router.push('/login');
    }
  }, [loginUser, router]);
  
  const {
    isConnected,
    isReconnecting,
    error,
    pendingMessages,
    sendMessage,
    // clearAllPendingMessages,
    // retryMessage,
    // markMessageAsRead,
    // setTypingStatus,
  } = useSupabaseChat(loginUser?.id || '', chatRoomId);

  
  
  // 获取聊天室信息
  // const { data: chatRoom } = trpc.chat.getChatRoomById.useQuery(
  //   { chatRoomId },
  //   { enabled: !!chatRoomId && !!loginUser?.id }
  // );
  
  // 获取聊天消息
  const { data: messages, isLoading: isLoadingMessages } = trpc.chat.getMessages.useQuery(
    { chatRoomId, limit: 50 },
    { enabled: !!chatRoomId && !!loginUser?.id }
  );
  
  // 获取聊天对象信息
  // const otherParticipant = chatRoom?.participants?.find(
  //   p => p.userId !== loginUser?.id
  // )?.user;
  
  // 监听消息输入
  // const handleInputChange = useCallback((val: string) => {
  //   setMessage(val);
    
  //   // 如果正在输入，设置打字状态
  //   if (!isTyping && val.length > 0) {
  //     setIsTyping(true);
  //     setTypingStatus(true);
  //   } else if (isTyping && val.length === 0) {
  //     setIsTyping(false);
  //     setTypingStatus(false);
  //   }
  // }, [isTyping, setTypingStatus]);
  const handleInputChange = (val: string) => {
    setMessage(val);
  };

  // 处理按键事件，回车发送消息，Shift+回车换行
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      handleSendMessage();
    }
  };

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messagesEndRef]);
  
  // 发送消息
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !loginUser?.id) return;
    
    // 停止打字状态
    // setIsTyping(false);
    // setTypingStatus(false);
    
    // 发送消息
    sendMessage({
      chatRoomId,
      content: message.trim(),
      messageType: MessageType.TEXT,
    });
    
    // 清空输入框
    setMessage('');
    
    // 滚动到底部
    scrollToBottom();
  }, [message, loginUser?.id, chatRoomId, sendMessage,scrollToBottom]);
  
  
  
  // 标记消息为已读
  // useEffect(() => {
    // if (!messages || !loginUser?.id) return;
    
    // // 使用之前定义的ref
    // const markedMessageIds = markedMessageIdsRef.current;
    
    // const unreadMessages = messages.filter(
    //   msg => msg.senderId !== loginUser.id && 
    //   !msg.readBy?.some(read => read.userId === loginUser.id) &&
    //   !markedMessageIds.has(msg.id)
    // );
    
    // unreadMessages.forEach(msg => {
    //   markMessageAsRead(msg.id);
    //   markedMessageIds.add(msg.id);
    // });
  // }, [messages, loginUser?.id, markMessageAsRead]);
  
  // 当消息加载完成后滚动到底部
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages,scrollToBottom]);

  // 过滤掉已经在数据库数据中存在的本地消息
  const filteredPendingMessages = pendingMessages.filter(pendingMsg => {
    // 如果存在temporary_id，检查是否已经在数据库消息中
    if (pendingMsg.temporary_id && messages) {
      // 如果数据库消息中已经存在相同的temporary_id，则过滤掉该本地消息
      return !messages.some(dbMsg => dbMsg.temporaryId === pendingMsg.temporary_id);
    }
    // 没有temporary_id的消息保留显示
    return true;
  });
  
  useEffect(()=>{
    
  },[messages]);
  
  // 格式化消息时间
  const formatMessageTime = (date: Date) => {
    return format(new Date(date), 'HH:mm', { locale: enUS });
  };
  
  // 是否要显示日期分割线
  const shouldShowDateDivider = (index: number) => {
    if (!messages) return false;
    
    if (index === 0) return true;
    
    const currentDate = new Date(messages[index].createdAt || '');
    const prevDate = new Date(messages[index - 1].createdAt || '');
    
    return currentDate.toDateString() !== prevDate.toDateString();
  };
  
  // 格式化日期分割线
  const formatDateDivider = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // 如果是今天，显示"今天"
    if (messageDate.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // 如果是昨天，显示"昨天"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // 否则显示日期
    return format(messageDate, 'yyyy-MM-dd', { locale: enUS });
  };
  
  // 根据连接状态显示状态条
  const renderConnectionStatus = () => {
    if (error) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-1 z-20">
          Connection error: {error.message}
        </div>
      );
    }
    
    if (isReconnecting) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-xs text-center py-1 z-20">
          Reconnecting...
        </div>
      );
    }
    
    if (!isConnected) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-xs text-center py-1 z-20">
          Disconnected, messages will be sent after reconnection
        </div>
      );
    }
    
    return null;
  };
  
  // 退出聊天室，彻底清理本地消息
  // useEffect(() => {
  //   return () => {
  //     // 离开页面时清理所有本地消息
  //     clearAllPendingMessages();
  //   };
  // }, [clearAllPendingMessages]);
  
  return (
    <div className="flex flex-col h-full">
      {renderConnectionStatus()}
      
      <div className="flex-1 overflow-y-auto p-3">
        {isLoadingMessages ? (
          <div className="p-4 space-y-4">
            <Skeleton.Title animated />
            <Skeleton.Paragraph lineCount={5} animated />
          </div>
        ) : (
          <>
            {/* 消息列表 */}
            <div className="space-y-3">
              {messages?.map((msg, index) => {
                const isOwnMessage = msg.senderId === loginUser?.id;
                
                return (
                  <div key={msg.id || `db-msg-${index}`}>
                    {/* 日期分割线 */}
                    {shouldShowDateDivider(index) && (
                      <div className="flex justify-center my-4">
                        <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {formatDateDivider(msg.createdAt || new Date())}
                        </div>
                      </div>
                    )}
                    
                    {/* 消息气泡 */}
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      {/* 对方头像 */}
                      {/* {!isOwnMessage && (
                        <Avatar
                          src={otherParticipant?.avatar || ''}
                          style={{ '--size': '36px' }}
                          className="mr-2"
                        />
                      )} */}
                      
                      {/* 消息内容 */}
                      <div
                        className={`max-w-[70%] ${
                          isOwnMessage
                            ? 'bg-lime-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                            : 'bg-white text-black rounded-tl-lg rounded-tr-lg rounded-br-lg border border-gray-200'
                        } p-3 shadow-sm`}
                      >
                        {/* 文本消息 */}
                        {msg.messageType === 'TEXT' && (
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        )}
                        
                        {/* 商品消息 */}
                        {msg.messageType === 'POST' && msg.post && (
                          <div className="flex items-center">
                            {msg.post.images && msg.post.images[0] && (
                              <Image
                                src={msg.post.images[0].imageUrl}
                                width={60}
                                height={60}
                                fit="cover"
                                className="rounded-lg mr-2"
                                alt={msg.post.title}
                              />
                            )}
                            <div>
                              <div className="text-sm font-semibold">{msg.post.title}</div>
                              <div className="text-sm">${msg.post.amount.toString()}</div>
                            </div>
                          </div>
                        )}
                        
                        {/* 消息时间 */}
                        <div
                          className={`text-[10px] mt-1 ${
                            isOwnMessage ? 'text-gray-100' : 'text-gray-500'
                          } text-right`}
                        >
                          {formatMessageTime(msg.createdAt || new Date())}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* 临时消息显示 */}
              {filteredPendingMessages.map(msg => (
                <div key={msg.temporary_id || msg.id || `local-msg-${msg.created_at}`} className="flex justify-end">
                  <div className="max-w-[70%] bg-lime-300 text-black rounded-tl-lg rounded-tr-lg rounded-bl-lg p-3 shadow-sm">
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    
                    {/* 消息状态 */}
                    <div className="text-[10px] mt-1 text-gray-700 text-right flex items-center justify-end">
                      <span className="mr-1">
                        {msg.status === MessageStatus.SENDING && 'Sending...'}
                        {msg.status === MessageStatus.SENT && 'Sent'}
                        {msg.status === MessageStatus.FAILED && 'Send failed'}
                        {msg.status === MessageStatus.STORED && 'Stored'}
                        {msg.status === MessageStatus.DELIVERED && 'Delivered'}
                        {msg.status === MessageStatus.READ && 'Read'}
                      </span>
                      
                      {/* 重试按钮 */}
                      {/* {msg.status === 'failed' && (
                        <button
                          className="text-xs text-blue-600"
                          onClick={() => retryMessage(msg.id)}
                        >
                          Retry
                        </button>
                      )} */}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 对方正在输入提示 otherUserTyping */}
              {false&& (
                <div className="flex justify-start">
                  {/* <Avatar
                    src={otherParticipant?.avatar || ''}
                    style={{ '--size': '36px' }}
                    className="mr-2"
                  /> */}
                  <div className="bg-white text-black rounded-lg p-2 px-3 shadow-sm border border-gray-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '250ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '500ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 用于滚动到底部的引用点 */}
              <div ref={messagesEndRef} className="h-20" />
            </div>
          </>
        )}
      </div>
      
      {/* 输入区域 */}
      <div className="p-2 border-t border-gray-200 bg-white">
        <div className="flex items-end">
          <TextArea
            placeholder="Enter message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1 bg-gray-100 rounded-xl p-2 mr-2 h-10"
          />
          <Button
            color="primary"
            disabled={!message.trim()}
            onClick={handleSendMessage}
            className="h-10 w-20"
            shape='rounded'
            style={{ 
              '--background-color': message.trim() ? '#65a30d' : '#d1d5db',
              '--text-color': '#ffffff',
              '--border-color':'none'
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
} 