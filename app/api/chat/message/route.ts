import { NextResponse } from 'next/server';
import { MessageStatus, SocketEvents } from '@/lib/types/socket';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const { 
      id, 
      chatRoomId, 
      senderId, 
      content, 
      postId, 
      messageType 
    } = body;
    
    // 验证必要字段
    if (!chatRoomId || !senderId || !id) {
      return NextResponse.json(
        { error: 'Missing required fields', status: MessageStatus.FAILED },
        { status: 400 }
      );
    }
    
    // 存储消息到数据库
    const storedMessage = await prisma.message.create({
      data: {
        chatRoomId,
        senderId,
        content: content || null,
        postId: postId || null,
        messageType
      },
      include: {
        sender: true,
        post: {
          include: {
            images: true,
          }
        }
      }
    });
    
    // 更新聊天室更新时间
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() }
    });
    
    // await supabase.from('chat_room_participants').update({
    //   is_typing: false,
    // }).eq('chat_room_id', chatRoomId).eq('user_id', senderId);
    
    
    return NextResponse.json({
      success: true,
      message: storedMessage,
      status: MessageStatus.STORED
    });
  } catch (error) {
    console.error('Error handling message:', error);
    return NextResponse.json(
      { error: 'Failed to process message', status: MessageStatus.FAILED },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { messageId, userId } = body;
    
    // 验证必要字段
    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 更新消息已读状态
    await prisma.messageReadBy.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        messageId,
        userId,
        readAt: new Date(),
      },
    });
    
    // 查找原消息以获取聊天室ID
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { chatRoomId: true, senderId: true }
    });
    
    if (message) {
      // 触发Pusher事件通知消息已读
      await pusher.trigger(`private-chat-${message.chatRoomId}`, SocketEvents.MESSAGE_READ, {
        messageId,
        userId,
        chatRoomId: message.chatRoomId,
        readAt: new Date()
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
} 