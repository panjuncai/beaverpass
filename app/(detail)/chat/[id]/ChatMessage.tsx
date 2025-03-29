import { MessageType } from "@/lib/types/enum";
import { MessageOutput } from "@/lib/trpc/client";
import { Bubble } from "@ant-design/x";
import { Avatar } from "antd-mobile";

interface ChatMessageProps {
  message: MessageOutput;
  isOwnMessage: boolean;
}
function PostBubble({ message, isOwnMessage }: ChatMessageProps){
  return (
    <div className="flex items-center gap-2">
              <Avatar src={message.post?.images[0].imageUrl??""} />
              <div className="flex flex-col">
                <h3 className={`font-bold text-base uppercase mb-1 ${isOwnMessage ? "text-black" : "text-gray-800"}`}>
                  {message.post?.title}
                </h3>
                <div className={`font-medium text-base mb-2 ${isOwnMessage ? "text-black" : "text-primary"}`}>
                  {parseFloat(message.post?.amount.toString() ?? "0") === 0 ? (
                    "Free"
                  ) : (
                    `$${message.post?.amount.toString()}`
                  )}
                </div>
              </div>
  </div>
  )
}
export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  // 计算消息发送的时间显示
  const getTimeDisplay = (date: Date | null | undefined) => {
    if (!date) return "";
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 24 * 60) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffMinutes / (60 * 24));
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };
  
  return (

      <div>
        {message.messageType === MessageType.TEXT && (
          <div key={message.id}>
            {message.messageType === MessageType.TEXT && (
              <Bubble placement={isOwnMessage ? "end" : "start"} variant={isOwnMessage ? "outlined" : "filled"} footer={<span className="text-xs text-gray-400">{getTimeDisplay(message.createdAt)}</span>} content={message.content} />
            )}
          </div>
        )}

        {message.messageType === MessageType.POST && message.post && (
          <div key={message.id}>
            {message.messageType === MessageType.POST && message.post && (
              <Bubble placement={isOwnMessage ? "end" : "start"} variant={isOwnMessage ? "outlined" : "filled"} footer={<span className="text-xs text-gray-400">{getTimeDisplay(message.createdAt)}</span>} content={<PostBubble message={message} isOwnMessage={isOwnMessage} />} />
            )}
          </div>
        )}
      </div>
  );
} 