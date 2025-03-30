import { NextResponse } from 'next/server';
import { SocketEvents } from '@/lib/types/socket';
import { prisma } from '@/lib/prisma';
import {createClient} from '@/utils/supabase/server'

/**
 * 处理加入聊天室请求
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { chatRoomId, userId } = body;
    
    // 验证必要字段
    if (!chatRoomId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 验证用户是否属于该聊天室
    const participant = await prisma.chatRoomParticipant.findFirst({
      where: {
        chatRoomId,
        userId,
      },
    });
    
    if (!participant) {
      return NextResponse.json(
        { error: 'User is not a participant of the chat room' },
        { status: 403 }
      );
    }
    
    // 更新用户在线状态
    await prisma.chatRoomParticipant.update({
      where: {
        chatRoomId_userId: {
          chatRoomId,
          userId,
        },
      },
      data: {
        isOnline: true,
        lastActiveAt: new Date(),
      },
    });
    
    // await pusher.trigger(`private-chat-${chatRoomId}`, SocketEvents.USER_ONLINE, userId);
    // 使用supabase触发事件
    await supabase.from('chat_room_participants').update({
      is_online: true,
      last_active_at: new Date(),
    }).eq('chat_room_id', chatRoomId).eq('user_id', userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining chat room:', error);
    return NextResponse.json(
      { error: 'Failed to join chat room' },
      { status: 500 }
    );
  }
}

/**
 * 处理离开聊天室请求
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { chatRoomId, userId } = body;
    
    // 验证必要字段
    if (!chatRoomId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 更新用户离线状态
    await prisma.chatRoomParticipant.update({
      where: {
        chatRoomId_userId: {
          chatRoomId,
          userId,
        },
      },
      data: {
        isOnline: false,
        lastActiveAt: new Date(),
      },
    });
    
    // await pusher.trigger(`private-chat-${chatRoomId}`, SocketEvents.USER_OFFLINE, userId);
    // 使用supabase触发事件
    await supabase.from('chat_room_participants').update({
      is_online: false,
      last_active_at: new Date(),
    }).eq('chat_room_id', chatRoomId).eq('user_id', userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving chat room:', error);
    return NextResponse.json(
      { error: 'Failed to leave chat room' },
      { status: 500 }
    );
  }
}

/**
 * 处理正在输入状态更新
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { chatRoomId, userId, isTyping } = body;
    
    // 验证必要字段
    if (!chatRoomId || !userId || typeof isTyping !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // await pusher.trigger(`private-chat-${chatRoomId}`, SocketEvents.MESSAGE_TYPING, {
    //   userId,
    //   isTyping,
    //   chatRoomId
    // });
    // 使用supabase触发事件
    await supabase.from('chat_room_participants').update({
      is_typing: isTyping,
    }).eq('chat_room_id', chatRoomId).eq('user_id', userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating typing status:', error);
    return NextResponse.json(
      { error: 'Failed to update typing status' },
      { status: 500 }
    );
  }
} 