import { SerializedPost } from "@/lib/types/post";
import { PostStatus } from "@/lib/types/enum";
// import PostCard from "@/components/post/post-card";
import NoDeal from "@/components/utils/no-deal";
import { TabType } from "@/lib/types/enum";

export default function DealsTabSell({activeTab,setActiveTab,sellTabState,setSellTabState,filteredPosts}:{
    activeTab:typeof TabType[keyof typeof TabType],
    setActiveTab:(tab:typeof TabType[keyof typeof TabType])=>void;
    sellTabState:typeof PostStatus[keyof typeof PostStatus],
    setSellTabState:(tab:typeof PostStatus[keyof typeof PostStatus])=>void;
    filteredPosts:SerializedPost[];
}) {
  return (<>
    <input
        type="radio"
        name="tabs_1"
        role="tab"
        className="tab text-primary font-bold text-xl"
        aria-label="Sell"
        checked={activeTab === TabType.SELL}
        onChange={() => setActiveTab(TabType.SELL)}
      /> 
          <div role="tabpanel" className="tab-content p-4 col-span-3">
            <div role="tablist" className="tabs tabs-boxed bg-base-100 grid grid-cols-3">
              <input
                type="radio"
                name="tabs_sell"
                role="tab"
                className="tab flex-1 text-xl"
                aria-label="Active"
                checked={sellTabState === PostStatus.ACTIVE}
                onChange={() => setSellTabState(PostStatus.ACTIVE)}
              />
              <div
                role="tabpanel"
                className="tab-content rounded-box p-6 w-full"
              >
                {filteredPosts.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <NoDeal />
                  </div>
                ) : (
                  filteredPosts.map(() => (
                    // <PostCard key={post.id} post={post} />
                    <></>
                    
                  ))
                )}
              </div>

              <input
                type="radio"
                name="tabs_sell"
                role="tab"
                className="tab flex-1 text-xl"
                aria-label="Inactive"
                checked={sellTabState === PostStatus.INACTIVE}
                onChange={() => setSellTabState(PostStatus.INACTIVE)}
              />
              <div
                role="tabpanel"
                className="tab-content rounded-box p-6 w-full"
              >
                {filteredPosts.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                        <NoDeal />
                  </div>
                ) : (
                  filteredPosts.map(() => (
                    // <PostCard key={post.id} post={post} />
                    <></>
                  ))
                )}
              </div>
              <input
                type="radio"
                name="tabs_sell"
                role="tab"
                className="tab flex-1 text-xl"
                aria-label="Sold"
                checked={sellTabState === PostStatus.SOLD}
                onChange={() => setSellTabState(PostStatus.SOLD)}
              />
              <div
                role="tabpanel"
                className="tab-content rounded-box p-6 w-full"
              >
                {filteredPosts.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <NoDeal />
                  </div>
                ) : (
                  filteredPosts.map(() => (
                    // <PostCard key={post.id} post={post} />
                    <></>
                  ))
                )}
              </div>
            </div>
          </div>
          </>
  )
}