'use client'
import { useRouter } from 'next/navigation'
import Loading from '@/components/utils/loading'
import { useRef } from 'react'
import { usePostStore } from '@/lib/store/post-store'
import { useAuthStore } from '@/lib/store/auth-store'

export default function PostDetailBuy() {
    const {loginUser,isLoading}=useAuthStore()
    const router=useRouter()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const post = usePostStore(state => state.currentPost)
    const setPreviewPost = usePostStore(state => state.setPreviewPost)

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
              disabled={loginUser?.id === post?.posterId}
              className="btn btn-primary btn-xl w-4/5 sm:w-1/2 rounded-full shadow-md" 
              onClick={() => {
                if (!loginUser?.id) {
                  dialogRef.current?.showModal()
                  return;
                }
                if (post) {
                  setPreviewPost(post)
                  void router.push(`/order-preview/${post.id}`)
                }
              }}
            >
              Buy now
            </button>
          </div>
    </>
  )
}