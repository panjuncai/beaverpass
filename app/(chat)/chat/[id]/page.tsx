'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useAuthStore } from '@/lib/store/auth-store';
import { Avatar, Button, Image, Skeleton, TextArea } from 'antd-mobile';
import { MessageType } from '@/lib/types/enum';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { usePusher } from '@/lib/hooks/usePusher';
import { useSupabaseChat } from '@/lib/hooks/useSupabaseChat';

export default function ChatDetailPage() {
  const router = useRouter();
  const { id: chatRoomId } = useParams<{ id: string }>();
  const { loginUser } = useAuthStore();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 如果没有登录，重定向到登录页
  useEffect(() => {
    if (!loginUser) {
      router.push('/login');
    }
  }, [loginUser, router]);
  
  // 初始化Pusher
  const {
    isConnected,
    isReconnecting,
    error,
    pendingMessages,
    sendMessage,
    retryMessage,
    markMessageAsRead,
    setTypingStatus,
  } = useSupabaseChat(loginUser?.id || '', chatRoomId);
  
  // 获取聊天室信息
  const { data: chatRoom } = trpc.chat.getChatRoomById.useQuery(
    { chatRoomId },
    { enabled: !!chatRoomId && !!loginUser?.id }
  );
  
  // 获取聊天消息
  const { data: messages, isLoading: isLoadingMessages } = trpc.chat.getMessages.useQuery(
    { chatRoomId, limit: 50 },
    { enabled: !!chatRoomId && !!loginUser?.id }
  );
  
  // 获取聊天对象信息
  const otherParticipant = chatRoom?.participants?.find(
    p => p.userId !== loginUser?.id
  )?.user;
  
  // 监听消息输入
  const handleInputChange = useCallback((val: string) => {
    setMessage(val);
    
    // 如果正在输入，设置打字状态
    if (!isTyping && val.length > 0) {
      setIsTyping(true);
      setTypingStatus(true);
    } else if (isTyping && val.length === 0) {
      setIsTyping(false);
      setTypingStatus(false);
    }
  }, [isTyping, setTypingStatus]);
  
  // 发送消息
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !loginUser?.id) return;
    
    // 停止打字状态
    setIsTyping(false);
    setTypingStatus(false);
    
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
  }, [message, loginUser?.id, chatRoomId, setTypingStatus, sendMessage]);
  
  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesEndRef]);
  
  // 标记消息为已读
  useEffect(() => {
    if (!messages || !loginUser?.id) return;
    
    // 缓存已经标记过的消息ID，避免重复标记
    const markedMessageIds = new Set<string>();
    
    // 找到所有不是自己发的且未读的消息
    const unreadMessages = messages.filter(
      msg => msg.senderId !== loginUser.id && 
      !msg.readBy?.some(read => read.userId === loginUser.id) &&
      !markedMessageIds.has(msg.id)
    );
    
    // 标记为已读
    unreadMessages.forEach(msg => {
      markMessageAsRead(msg.id);
      markedMessageIds.add(msg.id);
    });
  }, [messages, loginUser?.id, markMessageAsRead]);
  
  // 当消息加载完成后滚动到底部
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);
  
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
          Connection error, please check the network
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
                  <div key={msg.id}>
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
                      {!isOwnMessage && (
                        <Avatar
                          src={otherParticipant?.avatar || ''}
                          style={{ '--size': '36px' }}
                          className="mr-2"
                        />
                      )}
                      
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
              {pendingMessages.map(msg => (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[70%] bg-lime-300 text-black rounded-tl-lg rounded-tr-lg rounded-bl-lg p-3 shadow-sm">
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    
                    {/* 消息状态 */}
                    <div className="text-[10px] mt-1 text-gray-700 text-right flex items-center justify-end">
                      <span className="mr-1">
                        {msg.status === 'sending' && 'Sending...'}
                        {msg.status === 'failed' && 'Send failed'}
                      </span>
                      
                      {/* 重试按钮 */}
                      {msg.status === 'failed' && (
                        <button
                          className="text-xs text-blue-600"
                          onClick={() => retryMessage(msg.id)}
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 对方正在输入提示 */}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <Avatar
                    src={otherParticipant?.avatar || ''}
                    style={{ '--size': '36px' }}
                    className="mr-2"
                  />
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
              <div ref={messagesEndRef} className="h-1" />
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
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1 bg-gray-100 rounded-xl p-3 mr-2"
          />
          <Button
            color="primary"
            disabled={!message.trim()}
            onClick={handleSendMessage}
            className="h-10 w-20 rounded-xl"
            style={{ 
              '--background-color': message.trim() ? '#65a30d' : '#d1d5db',
              '--text-color': '#ffffff'
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
} 