export default function formatTime(date: Date | null | undefined) {
    if (!date) return "";
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} mins ago`;
    } else if (diffMinutes < 24 * 60) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
    } else if (diffMinutes < 48 * 60) {
      return "1 day ago";
    } else if (diffMinutes < 7 * 24 * 60) {
      const days = Math.floor(diffMinutes / (60 * 24));
      return `${days} days ago`;
    } else {
      return "1 week ago";
    }
  }

  export function formatDateTime(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始需+1[8](@ref)
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  export function formatSimpleTime(date: Date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${hours}:${minutes}`;
  }