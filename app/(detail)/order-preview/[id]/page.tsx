'use client'
import OrderPostDetail from "./order-preview-postdetail";
import { usePostStore } from '@/lib/store/post-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OrderPage() {
  const previewPost = usePostStore(state => state.previewPost)
  const router = useRouter()

  useEffect(() => {
    if (!previewPost) {
      router.push('/search')
    }
  }, [previewPost, router])

  if (!previewPost) {
    return null
  }

  return (
    <div className="p-4 space-y-6">
      <OrderPostDetail post={previewPost} />
    </div>
  );
}
