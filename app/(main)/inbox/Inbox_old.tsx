import LoginCard from "@/components/LoginCard/LoginCard";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useGetChatRoomsQuery } from "@/services/chatApi";
import { useNavigate } from "react-router-dom";
import CenteredLoading from "@/components/CenterLoading";
import { useEffect } from "react";
const Inbox: React.FC = () => {
  const { isAuthenticated, session} = useAuth();
  const {
    data: chatRooms,
    isLoading,
    refetch,
  } = useGetChatRoomsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const navigate = useNavigate();
  useEffect(() => {
    if (!session?.user?.id) void navigate("/login", { replace: true });
    const intervalId = setInterval(() => {
      void refetch();
    }, 6000); // 每6秒刷新一次
    return () => clearInterval(intervalId);
  }, [refetch, session?.user?.id, navigate]);

  const ChatRoomList = () => {
    return (
      <div className="flex-1 overflow-y-auto">
        {chatRooms?.map((room) => {
          const otherParticipant = room.participants.find(
            (p) => p._id !== session?.user?.id
          );
          const loginUserParticipant = room.participants.find(
            (p) => p._id === session?.user?.id
          );
          if (!otherParticipant || !loginUserParticipant) return null;
          return (
            <div
              key={room._id}
              className="flex items-center gap-4 p-4 hover:bg-base-200 cursor-pointer border-b"
              onClick={() =>
                void navigate(`/chat/${room._id}`, {
                  state: {
                    chatRoom: room,
                  },
                })
              }
            >
              <div className="relative">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img
                      src={`/avators/${otherParticipant.avatar}.png`}
                      alt="avatar"
                    />
                  </div>
                </div>
                {loginUserParticipant.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {loginUserParticipant.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">
                    {`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {room.lastMessage?.createdAt &&
                      formatDistanceToNow(
                        new Date(room.lastMessage.createdAt),
                        {
                          addSuffix: true,
                          locale: enUS,
                        }
                      )}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {/* 这里后续需要修改一下，当最新消息是Post时，需要转换 */}
                  {room.lastMessage?.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const LoginCardFunc = () => {
    return (
      <>
        <div className="flex flex-col h-full justify-center">
          <LoginCard></LoginCard>
        </div>
      </>
    );
  };

  const InboxBuyFunc = () => {
    return (
      <div className="flex-1">
        <div role="tablist" className="tabs tabs-bordered grid-cols-3 ">
          <input
            type="radio"
            name="tabs_1"
            role="tab"
            className="tab text-primary font-bold text-xl"
            aria-label="All"
            defaultChecked
          />
          <div role="tabpanel" className="tab-content">
            <ChatRoomList />
          </div>
          <input
            type="radio"
            name="tabs_1"
            role="tab"
            className="tab text-primary font-bold text-xl"
            aria-label="Buying"
          />
          <div role="tabpanel" className="tab-content p-10">
            Buying
          </div>

          <input
            type="radio"
            name="tabs_1"
            role="tab"
            className="tab text-primary font-bold text-xl"
            aria-label="Selling"
          />
          <div role="tabpanel" className="tab-content p-10">
            Selling
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <CenteredLoading />;
  }
  return (
    <div className="flex flex-col h-full">
      {isAuthenticated ? InboxBuyFunc() : LoginCardFunc()}
    </div>
  );
};
export default Inbox;
