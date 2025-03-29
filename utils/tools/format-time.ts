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