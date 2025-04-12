'use client';
import { useSupabaseChat2 } from '@/lib/hooks/useSupabaseChat3';
import { useAuthStore } from '@/lib/store/auth-store';
import { trpc } from '@/lib/trpc/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

// 定义消息类型
interface TestMessage {
  id: string;
  content?: string;
  sender_id?: string;
  chat_room_id?: string;
  message_type?: string;
  status?: string;
  created_at?: string;
  temporary_id?: string;
}

export default function TestPage() {
  const { loginUser } = useAuthStore();
  const supabase = createClientComponentClient();
  
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const { data: chatRooms, isLoading } = trpc.chat.getChatRooms.useQuery(
    { userId: loginUser?.id || '' },
  );

  const {
    isConnected,
    isReconnecting,
    error,
  } = useSupabaseChat2(loginUser?.id || '', chatRooms?.[0]?.id);
  
  // 设置Supabase监听器
  useEffect(() => {
    if (!chatRooms?.[0]?.id) return;
    
    const chatRoomId = chatRooms[0].id;
    
    // 添加日志
    setTestResults(prev => [...prev, `正在设置Supabase监听，聊天室ID: ${chatRoomId}`]);
    
    // 创建Supabase频道并监听事件
    const channel = supabase.channel(`test-channel-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_room_id=eq.${chatRoomId}`
      }, payload => {
        setTestResults(prev => [...prev, `收到新消息: ${JSON.stringify(payload.new)}`]);
        // 类型安全地添加消息
        if (payload.new) {
          setMessages(prev => [payload.new as TestMessage, ...prev]);
        }
      })
      .subscribe(status => {
        setTestResults(prev => [...prev, `Supabase频道状态: ${status}`]);
      });
      
    return () => {
      channel.unsubscribe();
    };
  }, [chatRooms, supabase]);

  // 插入测试消息
  const insertTestMessage = async () => {
    if (!chatRooms?.[0]?.id || !loginUser?.id) {
      setTestResults(prev => [...prev, '错误: 没有聊天室或未登录']);
      return;
    }
    
    try {
      const testContent = `测试消息 ${new Date().toISOString()}`;
      setTestResults(prev => [...prev, `正在插入测试消息: ${testContent}`]);
      
      // 修复可能的cookie问题
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRooms[0].id,
          sender_id: loginUser.id,
          content: testContent,
          message_type: 'TEXT',
          status: 'SENT'
        })
        .select();
        
      if (error) {
        setTestResults(prev => [...prev, `错误: ${error.message}`]);
      } else {
        setTestResults(prev => [...prev, `成功插入消息: ${JSON.stringify(data)}`]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `异常: ${error instanceof Error ? error.message : String(error)}`]);
    }
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isReconnecting) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-xs text-center py-1 z-20">
        Reconnecting...
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-1 z-20">
        Connection error, reason: {error.message}
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">聊天室实时测试</h1>
      
      <div className="mb-4">
        <div>连接状态: {isConnected ? '已连接' : '未连接'}</div>
        <div>当前聊天室: {chatRooms?.[0]?.id || '无'}</div>
        <div>当前用户: {loginUser?.id || '未登录'}</div>
      </div>
      
      <button 
        onClick={insertTestMessage}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        插入测试消息
      </button>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">测试结果日志</h2>
          <div className="border p-2 h-96 overflow-y-auto bg-gray-100">
            {testResults.map((log, index) => (
              <div key={index} className="mb-1 text-sm">
                {log}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">接收到的消息</h2>
          <div className="border p-2 h-96 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2 p-2 bg-white shadow rounded">
                <div className="font-medium">{msg.content}</div>
                <div className="text-xs text-gray-500">
                  ID: {msg.id?.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}