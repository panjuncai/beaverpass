import { useRouter } from "next/navigation";
import { SearchOutline, CameraOutline } from 'antd-mobile-icons'

export default function Footer() {
    const router = useRouter();
  return (
    <div className="dock">
      <button onClick={() => router.push('/search')}>
        <SearchOutline fontSize={24} />
        <span className="dock-label">Search</span>
      </button>
      <button onClick={() => router.push('/post')}>
        <CameraOutline fontSize={24} />
        <span className="dock-label">Post</span>
      </button>
    </div>
  );
}
