"use client"
import { OrderStatus, PostStatus } from "@/lib/types/enum";
import NoLogin from "@/components/utils/no-login";
import { useAuthStore } from "@/lib/store/auth-store";
import Loading from "@/components/utils/loading";
import { trpc } from "@/lib/trpc/client";
import { SerializedPost } from "@/lib/types/post";
import { Tabs } from 'antd-mobile'
import DealsOrderCard from "./deals-order-card";
import NoDeal from "@/components/utils/no-deal";
import PostCard from "./post-card";

export default function DealsPage() {
  const { loginUser, isLoading } = useAuthStore();
  console.log(`loginUser------: ${JSON.stringify(loginUser)}`);
  if(!loginUser) {
    return <div className="flex flex-col h-full justify-center">
      <NoLogin />
    </div>;
  }
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
  // console.log(`loginUserPosts------: ${JSON.stringify(loginUserPosts)}`);
  // console.log(`loginUserOrders------: ${JSON.stringify(loginUserOrders)}`);
  console.log(`loginUser------: ${JSON.stringify(loginUser)}`);
  console.log(`isLoading------: ${isLoading}`);
  console.log(`isLoadingPosts------: ${isLoadingPosts}`);
  console.log(`isLoadingOrders------: ${isLoadingOrders}`);

  const activeOrderStatuses = [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.SHIPPED] as const;
  const historyOrderStatuses = [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REFUNDED] as const;

  const getFilteredPosts = (types: (typeof PostStatus)[keyof typeof PostStatus][]): SerializedPost[] => {
    if (!loginUserPosts) return [];
    return loginUserPosts
      .filter((post) => post.status && types.includes(post.status as (typeof PostStatus)[keyof typeof PostStatus]))
      .map(post => ({
        ...post,
        amount: Number(post.amount)
      }));
  };

  const isActiveOrder = (status: string | null) => {
    return status && activeOrderStatuses.includes(status as typeof activeOrderStatuses[number]);
  };

  const isHistoryOrder = (status: string | null) => {
    return status && historyOrderStatuses.includes(status as typeof historyOrderStatuses[number]);
  };

  if (isLoading || isLoadingOrders||isLoadingPosts) {
    return <Loading />;
  }
  return (
    <div className="flex flex-col h-full">
      {loginUser ? (
        <div className="flex-1">
          <Tabs>
            {/* <DealsTabBuy
              activeOrders={loginUserOrders?.filter((order) => isActiveOrder(order.status)) ?? []}
              historyOrders={loginUserOrders?.filter((order) => isHistoryOrder(order.status)) ?? []}
            /> */}
            <Tabs.Tab title="Buy" key="buy">
      <Tabs>
        <Tabs.Tab title="Active Orders" key="active-orders">
          <div>
            {loginUserOrders?.filter((order) => isActiveOrder(order.status)).length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <NoDeal />
              </div>
            ) : (
              loginUserOrders?.filter((order) => isActiveOrder(order.status)).map((order) => (
                <DealsOrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </Tabs.Tab>
        <Tabs.Tab title="History" key="history">
          <div>
            {loginUserOrders?.filter((order) => isHistoryOrder(order.status)).length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <NoDeal />
              </div>
            ) : (
              loginUserOrders?.filter((order) => isHistoryOrder(order.status)).map((order) => (
                <DealsOrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </Tabs.Tab>
      </Tabs>
    </Tabs.Tab>
    <Tabs.Tab title="Sell" key="sell">
        <Tabs>
          <Tabs.Tab title="Active" key="active">
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
          </Tabs.Tab>
          <Tabs.Tab title="Inactive" key="inactive">
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
          </Tabs.Tab>
          <Tabs.Tab title="Sold" key="sold">
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
          </Tabs.Tab>
        </Tabs>
      </Tabs.Tab>
          </Tabs>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-center">
          <NoLogin />
        </div>
      )}
    </div>
  );
}
