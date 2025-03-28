import { PostStatus } from "@/lib/types/enum";
import { SerializedPost } from "@/lib/types/post";
import { trpc } from "@/lib/trpc/client";
import Image from "next/image";
import { useState } from "react";
// import Loading from "@/components/utils/loading";
export default function PostCard({post}: {post: SerializedPost}) {
    const utils = trpc.useUtils();
    const [activeAction, setActiveAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);
    
    const updatePostMutation = trpc.post.updatePost.useMutation({
      onSuccess: () => {
        utils.post.getPosts.invalidate();
        setActiveAction(null); // 重置状态
      }
    });

    const handleStatusChange = async (newStatus: typeof PostStatus[keyof typeof PostStatus]) => {
      try {
        // 设置当前正在执行的操作
        if (newStatus === PostStatus.ACTIVE) {
          setActiveAction('activate');
        } else if (newStatus === PostStatus.INACTIVE) {
          setActiveAction('deactivate');
        } else if (newStatus === PostStatus.DELETED) {
          setActiveAction('delete');
        }
        
        await updatePostMutation.mutateAsync({ id: post.id, status: newStatus });
      } catch(error) {
        console.log('update post statuserror',error);
        setActiveAction(null); // 发生错误时重置状态
      }
    };
   
    return (
      <div className="card bg-base-100 shadow-md mb-4">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <Image
              src={post.images?.[0]?.imageUrl || ''}
              alt={post.title}
              className="w-24 h-24 object-cover rounded-lg"
              width={96}
              height={96}
            />
            <div className="flex-1">
              <h3 className="card-title">{post.title}</h3>
              <div className="badge badge-outline">{post.status}</div>
              <p className="text-xl font-bold mt-2">
                ${post.amount===0 ? 'Free' : post.amount}
                {post.isNegotiable && <span className="text-sm ml-2">Negotiable</span>}
              </p>
            </div>
          </div>
          <div className="divider my-2"></div>
          <div className="flex justify-between items-center text-sm">
            <span>Posted: {new Date(post.createdAt || '').toLocaleDateString()}</span>
            <div className="flex gap-2">
              {post.status === PostStatus.ACTIVE ? (
                <>
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => void handleStatusChange(PostStatus.INACTIVE)}
                    disabled={activeAction !== null}
                  >
                    {activeAction === 'deactivate' ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Deactivate'
                    )}
                  </button>
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={() => void handleStatusChange(PostStatus.DELETED)}
                    disabled={activeAction !== null}
                  >
                    {activeAction === 'delete' ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </>
              ) : post.status === PostStatus.INACTIVE ? (
                <>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => void handleStatusChange(PostStatus.ACTIVE)}
                    disabled={activeAction !== null}
                  >
                    {activeAction === 'activate' ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Activate'
                    )}
                  </button>
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={() => void handleStatusChange(PostStatus.DELETED)}
                    disabled={activeAction !== null}
                  >
                    {activeAction === 'delete' ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };
