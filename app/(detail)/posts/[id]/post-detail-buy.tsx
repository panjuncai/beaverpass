'use client'
import { useRouter } from 'next/navigation'
import Loading from '@/components/utils/loading'
import { useRef } from 'react'
import { usePostStore } from '@/lib/store/post-store'
import { useAuthStore } from '@/lib/store/auth-store'
import MessageModal from '@/components/modals/message-modal'
import { Button } from 'antd-mobile'

export default function PostDetailBuy() {
    const {loginUser,isLoading}=useAuthStore()
    const router=useRouter()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const post = usePostStore(state => state.currentPost)
    const setPreviewPost = usePostStore(state => state.setPreviewPost)

    if(isLoading) return <Loading />
  return (
    <>
    <MessageModal 
      title="Please login first"
      content="You need to login to buy the product"
      dialogRef={dialogRef}
      redirectUrl="/login"
    />

    <div className="fixed bottom-4 left-4 right-4 flex justify-center">
            <Button 
              disabled={loginUser?.id === post?.posterId}
              block
              color="primary"
              size="large"
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
            </Button>
          </div>
    </>
  )
}