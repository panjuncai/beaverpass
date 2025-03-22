'use client'
import {trpc} from '@/lib/trpc/client'
import { usePost } from '@/contexts/post-context'
import { useRouter } from 'next/navigation'
import Loading from '@/components/utils/loading'
import { useRef } from 'react'

export default function PostDetailBuy() {
    const {data:userData,isLoading}=trpc.auth.getUser.useQuery()
    const currentUser=userData?.user
    const {post}=usePost()
    const router=useRouter()
    const dialogRef = useRef<HTMLDialogElement>(null)

    if(isLoading) return <Loading />
  return (
    <>
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <h2 className="font-bold text-lg">Please login first</h2>
        <p className="py-4">You need to login to buy the product</p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost mr-2" onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button className="btn btn-primary" onClick={() => {
              dialogRef.current?.close()
              void router.push('/login')
            }}>Login</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <button 
              disabled={currentUser?.id === post?.posterId}
              className="btn btn-primary btn-xl w-4/5 sm:w-1/2 rounded-full shadow-md" 
              onClick={() => {
                if (!currentUser?.id) {
                  dialogRef.current?.showModal()
                  return;
                }
                if (post && post.images?.[0]?.imageUrl) {
                  const queryParams = new URLSearchParams({
                    title: post.title,
                    amount: post.amount.toString(),
                    posterId: post.posterId || '',
                    category: post.category,
                    condition: post.condition,
                    deliveryType: post.deliveryType,
                    status: post.status || 'Available',
                    posterEmail: post.poster?.email || '',
                    posterFirstName: post.poster?.firstName || '',
                    posterLastName: post.poster?.lastName || '',
                    frontImage: post.images[0].imageUrl,
                    description: post.description
                  }).toString();
                  void router.push(`/order-preview/${post.id}?${queryParams}`);
                }
              }}
            >
              Buy now
            </button>
          </div>
    </>
  )
}