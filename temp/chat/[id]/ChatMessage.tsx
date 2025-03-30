import { MessageType } from "@/lib/types/enum";
import { MessageOutput } from "@/lib/trpc/client";
import { Bubble } from "@ant-design/x";
import { Avatar } from "antd-mobile";
import formatTime from "@/utils/tools/format-time";
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
    
  return (

      <div>
        {message.messageType === MessageType.TEXT && (
          <div key={message.id}>
            {message.messageType === MessageType.TEXT && (
              <Bubble placement={isOwnMessage ? "end" : "start"} variant={isOwnMessage ? "outlined" : "filled"} footer={<span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>} content={message.content} />
            )}
          </div>
        )}

        {message.messageType === MessageType.POST && message.post && (
          <div key={message.id}>
            {message.messageType === MessageType.POST && message.post && (
              <Bubble placement={isOwnMessage ? "end" : "start"} variant={isOwnMessage ? "outlined" : "filled"} footer={<span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>} content={<PostBubble message={message} isOwnMessage={isOwnMessage} />} />
            )}
          </div>
        )}
      </div>
  );
} 