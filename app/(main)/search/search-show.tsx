'use client'
import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";  
import { HeartOutline } from "antd-mobile-icons";
import { useState } from "react";
import Loading from "@/components/utils/loading";

export default function ProductsShow({selectedCategory,search}:{selectedCategory:string,search:string}) {
  const router = useRouter();
  const [isLoading,setIsLoading] = useState(false)

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
                  <button className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center">
                    {/* {index % 2 === 0 ? (
                      <HeartOutline fontSize={24} />
                    ) : (
                      <HeartFill color="#BED596" fontSize={24} />
                    )} */}
                    <HeartOutline fontSize={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
  </>
  );
}