'use client'
import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";  
import { HeartOutline, HeartFill } from "antd-mobile-icons";
import { useState } from "react";
import { Skeleton, InfiniteScroll } from "antd-mobile";

export default function ProductsShow({selectedCategory,search}:{selectedCategory:string,search:string}) {
  const router = useRouter();
  const [isLoading,setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [hasMore, setHasMore] = useState(true);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const { data: postsData, isLoading: isLoadingPosts, fetchNextPage, hasNextPage } = trpc.post.getPosts.useInfiniteQuery(
    {
      limit: 10,
      search: search,
      category: selectedCategory === "All" ? "" : selectedCategory,
    },
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage.nextCursor) {
          return undefined;
        }
        return lastPage.nextCursor.id;
      },
    }
  );

  const loadMore = async () => {
    if (hasNextPage) {
      await fetchNextPage();
    } else {
      setHasMore(false);
    }
  };

  // 渲染骨架屏
  const renderSkeleton = () => {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <div key={index} className="card bg-base-100 shadow-md">
            <figure className="h-[200px] w-full">
              <Skeleton
                animated
                style={{
                  '--width': '100%',
                  '--height': '200px',
                }}
              />
            </figure>
            <div className="card-body" style={{ "--padding-card": "0.5rem" } as React.CSSProperties}>
              <Skeleton
                animated
                style={{
                  '--width': '80%',
                  '--height': '20px',
                }}
                className="mb-2"
              />
              <Skeleton
                animated
                style={{
                  '--width': '60%',
                  '--height': '16px',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if(isLoading||isLoadingPosts) return renderSkeleton();

  const allPosts = postsData?.pages.flatMap(page => page.items) || [];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {allPosts.map((post) => (
          <div key={post.id} className="card bg-base-100 shadow-md transition-colors duration-300 hover:bg-gray-100 cursor-pointer group">
            <figure
              onClick={() => {
                setIsLoading(true)
                void router.push(`/posts/${post.id}`);
              }}
              className="h-[200px] w-full"
            >
              <div className="relative w-full h-full">
                <Image
                  src={post?.images[0]?.imageUrl || ""}
                  alt={post.title}
                  className="object-cover"
                  fill
                  priority={allPosts.indexOf(post) < 4}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <button 
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10 hover:bg-white transition-colors duration-300"
                  onClick={(e) => toggleFavorite(post.id, e)}
                >
                  {favorites[post.id] ? (
                    <HeartFill fontSize={18} className="text-[#7EAC2D]" />
                  ) : (
                    <HeartOutline fontSize={18} className="text-gray-600 opacity-50" />
                  )}
                </button>
              </div>
            </figure>
            <div
              className="card-body"
              style={{ "--padding-card": "0.5rem" } as React.CSSProperties}
            >
              <h2 className="card-title text-black text-sm md:text-base font-normal font-['Poppins'] truncate">{post.title}</h2>
              <p className="text-black text-sm md:text-base font-medium font-['Poppins']">
                {post.amount.toString() === "0" ? "Free" : "$" + post.amount.toString()}{" "}
                <em className="text-xs text-gray-500">{post.isNegotiable ? "Negotiable" : ""}</em>
              </p>
            </div>
          </div>
        ))}
      </div>
      <InfiniteScroll 
        loadMore={loadMore} 
        hasMore={hasMore}
        threshold={250}
      >
        {(hasMore: boolean) => (
          hasMore ? (
            <div className="text-center py-4">
              <span className="text-gray-500 text-sm">Loading...</span>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-gray-500 text-sm">No more posts</span>
            </div>
          )
        )}
      </InfiniteScroll>
    </>
  );
}