import { NextResponse } from 'next/server';
import { MessageStatus } from '@/lib/types/enum';
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
        temporaryId: id, // 保存临时ID以便前端识别
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
    
    // 关闭用户正在输入状态
    await supabase.from('chat_room_participants').update({
      is_typing: false,
    }).eq('chat_room_id', chatRoomId).eq('user_id', senderId);
    
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
      // 触发Supabase事件通知消息已读
      // 这里不需要额外触发事件，Supabase realtime会自动处理
      // message_read_by表的更改会被监听者接收到
      console.log('Message marked as read:', messageId, 'by user:', userId);
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