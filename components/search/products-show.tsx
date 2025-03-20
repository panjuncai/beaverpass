import Image from "next/image";
import { trpc } from "@/lib/trpc/client";

export default function ProductsShow() {
  const { data: posts } = trpc.post.getPosts.useQuery({
    limit: 10,
  });
  return (
  <>
    <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
            {posts?.map((post) => (
              <div key={post.id} className="card bg-base-100 shadow-md">
                <figure
                  onClick={() => {
                    void navigate(`/posts/${post.id}`);
                  }}
                >
                  <Image
                    // className="h-44 w-full"
                    width={176}
                    height={176}
                    src={post.images[0].imageUrl || ""}
                    alt={post.title}
                  />
                </figure>
                <div
                  className="card-body"
                  style={{ "--padding-card": "0.5rem" } as React.CSSProperties}
                >
                  <h2 className="card-title">{post.title}</h2>
                  <p>
                    ${post.amount===0? "Free" : post.amount}{" "}
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