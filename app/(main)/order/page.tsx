import { Metadata } from 'next';
import { OrderForm }   from './order-form';
export const metadata: Metadata = {
  title: 'Post | BeaverPass',
  description: 'Order a Product',
};

export default function OrderPage() {
  const postId="04e132ce-7700-4826-85bd-05ce6a9d320f"
  const sellerId="d9b858ad-d3c1-4916-b2af-103e3f46f309"
  const total=100
  return (
    <div className="container px-4 py-8 mx-auto">
      <OrderForm postId={postId} sellerId={sellerId} total={total} />
    </div>
  );
} 