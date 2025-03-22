'use client'
import OrderPostDetail from "./order-preview-postdetail";
import { useSearchParams } from 'next/navigation'
import { useEffect,useState} from 'react'
import { SerializedPost } from "@/contexts/post-context";

export default function OrderPage() {
  const searchParams = useSearchParams()
  const [post,setPost] = useState<SerializedPost | null>(null)
  
  useEffect(() => {
    const title = searchParams.get('title')
    const amount = searchParams.get('amount')
    const posterId = searchParams.get('posterId')
    const category = searchParams.get('category')
    const condition = searchParams.get('condition')
    const deliveryType = searchParams.get('deliveryType')
    const status = searchParams.get('status')
    const posterEmail = searchParams.get('posterEmail')
    const posterFirstName = searchParams.get('posterFirstName')
    const posterLastName = searchParams.get('posterLastName')
    const frontImage = searchParams.get('frontImage')
    const description = searchParams.get('description')
    if (title && amount && posterId && frontImage) {
      setPost({
        id: window.location.pathname.split('/').pop() || '',
        title: decodeURIComponent(title),
        amount: parseFloat(amount),
        posterId,
        images: [{id: '',createdAt: new Date(),imageType: 'FRONT',postId: '',imageUrl:frontImage}],
        createdAt: new Date(),
        updatedAt: new Date(),
        isNegotiable: false,
        description: description || '',
        category: category || 'Other',
        condition: condition || 'Used',
        deliveryType: deliveryType || 'Pickup',
        status: status || 'Available',
        poster: {
          id: posterId,
          email: posterEmail || '',
          firstName: posterFirstName || '',
          lastName: posterLastName || '',
          avatar: null,
          phone: null,
          address: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }
  }, [searchParams])

  return (
    <div className="p-4 space-y-6">
      {post && <OrderPostDetail post={post} />}
    </div>
  );
}
