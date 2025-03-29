// 仅包含输入类型接口，移除了不再需要的类型定义

// 这些输入类型接口仍然需要，因为它们用于定义 API 输入
export interface CreateChatRoomInput {
  participantIds: string[];
  postId?: string; // 可选，如果创建时要发送商品信息
}

export interface SendMessageInput {
  chatRoomId: string;
  content?: string; // 文本消息内容
  postId?: string; // 发送商品消息时的商品ID
  messageType: string;
}

export interface GetChatRoomsInput {
  userId: string;
}

export interface GetMessagesInput {
  chatRoomId: string;
  limit?: number;
  cursor?: string;
}

export interface MarkMessageReadInput {
  messageId: string;
  userId: string;
}
