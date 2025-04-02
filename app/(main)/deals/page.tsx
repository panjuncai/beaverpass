"use client";
import { useEffect, useState } from 'react';
import { OrderStatus, PostStatus } from "@/lib/types/enum";
import NoLogin from "@/components/utils/no-login";
import { useAuthStore } from "@/lib/store/auth-store";
import Loading from "@/components/utils/loading";
import { trpc } from "@/lib/trpc/client";
import { SerializedPost } from "@/lib/types/post";
import DealsOrderCard from "./deals-order-card";
import NoDeal from "@/components/utils/no-deal";
import PostCard from "./post-card";

export default function DealsPage() {
  const { loginUser, isLoading } = useAuthStore();
  const {data:loginUserOrders,isLoading:isLoadingOrders} = trpc.order.getOrders.useQuery({
    buyerId: loginUser?.id,
    include: {
      post: {
        include: {
          images: true
        }
      },
      buyer: true,
      seller: true
    }
  }, {
    enabled: !!loginUser?.id
  });

  const {data:loginUserPosts,isLoading:isLoadingPosts} = trpc.post.getPosts.useQuery({
    posterId: loginUser?.id
  }, {
    enabled: !!loginUser?.id
  });

  const [activeTab, setActiveTab] = useState('buy');
  const [activeSubTab, setActiveSubTab] = useState('active');

  useEffect(() => {
    console.log('Auth State:', { loginUser, isLoading });
  }, [loginUser, isLoading]);

  if (!loginUser) {
    return (
      <div className="flex flex-col h-full justify-center">
        <NoLogin />
      </div>
    );
  }

  if (isLoading || isLoadingOrders || isLoadingPosts) {
    return <Loading />;
  }

  const activeOrderStatuses = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
  ] as const;
  const historyOrderStatuses = [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
  ] as const;

  const getFilteredPosts = (
    types: (typeof PostStatus)[keyof typeof PostStatus][]
  ): SerializedPost[] => {
    if (!loginUserPosts) return [];
    return loginUserPosts
      .filter(
        (post) =>
          post.status &&
          types.includes(
            post.status as (typeof PostStatus)[keyof typeof PostStatus]
          )
      )
      .map((post) => ({
        ...post,
        amount: Number(post.amount),
      }));
  };

  const isActiveOrder = (status: string | null) => {
    return (
      status &&
      activeOrderStatuses.includes(
        status as (typeof activeOrderStatuses)[number]
      )
    );
  };

  const isHistoryOrder = (status: string | null) => {
    return (
      status &&
      historyOrderStatuses.includes(
        status as (typeof historyOrderStatuses)[number]
      )
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-screen-md mx-auto px-4 pt-4">
      {/* Buy/Sell Tabs */}
      <div className="w-full flex justify-center mb-4 relative">
        <button 
          onClick={() => setActiveTab('buy')}
          className="flex-1 max-w-[384px] rounded-[10px] relative"
        >
          <div className="h-9 text-center">
            <span className={`text-base font-bold font-['Poppins'] leading-10 ${
              activeTab === 'buy' ? 'text-yellow-950' : 'text-zinc-400'
            }`}>
              Buy
            </span>
          </div>
          {activeTab === 'buy' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-950"></div>
          )}
          {activeTab !== 'buy' && (
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-zinc-200"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('sell')}
          className="flex-1 max-w-[384px] rounded-[10px] relative"
        >
          <div className="h-9 text-center">
            <span className={`text-base font-bold font-['Poppins'] leading-10 ${
              activeTab === 'sell' ? 'text-yellow-950' : 'text-zinc-400'
            }`}>
              Sell
            </span>
          </div>
          {activeTab === 'sell' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-950"></div>
          )}
          {activeTab !== 'sell' && (
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-zinc-200"></div>
          )}
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="w-full flex">
        {activeTab === 'buy' ? (
          // Buy sub-tabs
          <>
            <button 
              onClick={() => setActiveSubTab('active')}
              className={`flex-1 h-10 relative ${
                activeSubTab === 'active' 
                  ? 'bg-[#89C149] rounded-tl-[10px] rounded-tr-[10px]' 
                  : 'bg-white border border-zinc-100 rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[0px] rounded-br-[0px]'
              }`}
            >
              <span className={`w-full h-10 flex items-center justify-center text-sm font-medium font-['Poppins'] tracking-wide ${
                activeSubTab === 'active' ? 'text-white' : 'text-zinc-400'
              }`}>
                Active Orders
              </span>
            </button>
            <button 
              onClick={() => setActiveSubTab('history')}
              className={`flex-1 h-10 relative ml-2 ${
                activeSubTab === 'history' 
                  ? 'bg-[#89C149] rounded-tl-[10px] rounded-tr-[10px]' 
                  : 'bg-white border border-zinc-100 rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[0px] rounded-br-[0px]'
              }`}
            >
              <span className={`w-full h-10 flex items-center justify-center text-sm font-medium font-['Poppins'] tracking-wide ${
                activeSubTab === 'history' ? 'text-white' : 'text-zinc-400'
              }`}>
                History
              </span>
            </button>
          </>
        ) : (
          // Sell sub-tabs
          <>
            <button 
              onClick={() => setActiveSubTab('active')}
              className={`flex-1 h-10 relative ${
                activeSubTab === 'active' 
                  ? 'bg-[#89C149] rounded-tl-[10px] rounded-tr-[10px]' 
                  : 'bg-white border border-zinc-100 rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[0px] rounded-br-[0px]'
              }`}
            >
              <span className={`w-full h-10 flex items-center justify-center text-sm font-medium font-['Poppins'] tracking-wide ${
                activeSubTab === 'active' ? 'text-white' : 'text-zinc-400'
              }`}>
                Active
              </span>
            </button>
            <button 
              onClick={() => setActiveSubTab('inactive')}
              className={`flex-1 h-10 relative mx-2 ${
                activeSubTab === 'inactive' 
                  ? 'bg-[#89C149] rounded-tl-[10px] rounded-tr-[10px]' 
                  : 'bg-white border border-zinc-100 rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[0px] rounded-br-[0px]'
              }`}
            >
              <span className={`w-full h-10 flex items-center justify-center text-sm font-medium font-['Poppins'] tracking-wide ${
                activeSubTab === 'inactive' ? 'text-white' : 'text-zinc-400'
              }`}>
                Inactive
              </span>
            </button>
            <button 
              onClick={() => setActiveSubTab('sold')}
              className={`flex-1 h-10 relative ${
                activeSubTab === 'sold' 
                  ? 'bg-[#89C149] rounded-tl-[10px] rounded-tr-[10px]' 
                  : 'bg-white border border-zinc-100 rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[0px] rounded-br-[0px]'
              }`}
            >
              <span className={`w-full h-10 flex items-center justify-center text-sm font-medium font-['Poppins'] tracking-wide ${
                activeSubTab === 'sold' ? 'text-white' : 'text-zinc-400'
              }`}>
                Sold
              </span>
            </button>
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="w-full mt-4">
        {activeTab === 'buy' ? (
          <div>
            {activeSubTab === 'active' ? (
              <div>
                {loginUserOrders?.filter((order) =>
                  isActiveOrder(order.status)
                ).length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <NoDeal />
                  </div>
                ) : (
                  loginUserOrders
                    ?.filter((order) => isActiveOrder(order.status))
                    .map((order) => (
                      <DealsOrderCard key={order.id} order={order} />
                    ))
                )}
              </div>
            ) : (
              <div>
                {loginUserOrders?.filter((order) =>
                  isHistoryOrder(order.status)
                ).length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <NoDeal />
                  </div>
                ) : (
                  loginUserOrders
                    ?.filter((order) => isHistoryOrder(order.status))
                    .map((order) => (
                      <DealsOrderCard key={order.id} order={order} />
                    ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {activeSubTab === 'active' && (
              <div>
                {getFilteredPosts([PostStatus.ACTIVE]).length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <NoDeal />
                  </div>
                ) : (
                  getFilteredPosts([PostStatus.ACTIVE]).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            )}
            {activeSubTab === 'inactive' && (
              <div>
                {getFilteredPosts([PostStatus.INACTIVE]).length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <NoDeal />
                  </div>
                ) : (
                  getFilteredPosts([PostStatus.INACTIVE]).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            )}
            {activeSubTab === 'sold' && (
              <div>
                {getFilteredPosts([PostStatus.SOLD]).length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <NoDeal />
                  </div>
                ) : (
                  getFilteredPosts([PostStatus.SOLD]).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
