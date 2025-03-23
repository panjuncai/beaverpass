import { create } from 'zustand'
import type { SerializedPost } from '@/lib/types/post'

interface PostStore {
  // 当前浏览的商品
  currentPost: SerializedPost | null
  setCurrentPost: (post: SerializedPost | null) => void
  // 预览订单的商品
  previewPost: SerializedPost | null
  setPreviewPost: (post: SerializedPost | null) => void
  // 清理函数
  clearAll: () => void
}

export const usePostStore = create<PostStore>()((set) => ({
  currentPost: null,
  setCurrentPost: (post) => set({ currentPost: post }),
  previewPost: null,
  setPreviewPost: (post) => set({ previewPost: post, currentPost: post }),
  clearAll: () => set({ currentPost: null, previewPost: null })
})) 