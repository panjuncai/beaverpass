'use client'
import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";  
import { HeartOutline, HeartFill } from "antd-mobile-icons";
import { useState } from "react";
import Loading from "@/components/utils/loading";

export default function ProductsShow({selectedCategory,search}:{selectedCategory:string,search:string}) {
  const router = useRouter();
  const [isLoading,setIsLoading] = useState(false)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const { data: posts,isLoading:isLoadingPosts } = trpc.post.getPosts.useQuery({
    limit: 10,
    search: search,
    category: selectedCategory==="All" ? "" : selectedCategory,
  });
  if(isLoading||isLoadingPosts) return <Loading />
  return (
  <>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {posts?.map((post) => (
              <div key={post.id} className="card bg-base-100 shadow-md">
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
                      priority={posts?.indexOf(post) < 4}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <button 
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10 hover:bg-white transition-all"
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
                  <h2 className="card-title">{post.title}</h2>
                  <p>
                    ${post.amount.toString() === "0" ? "Free" : post.amount.toString()}{" "}
                    <em>{post.isNegotiable ? "Negotiable" : ""}</em>
                  </p>
                </div>
              </div>
            ))}
          </div>
  </>
  );
}