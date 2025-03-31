import { Skeleton } from "antd-mobile";

export default function Loading() {
  return (
    // <div className="flex justify-center items-center h-screen">
    //   <span className="loading loading-spinner loading-xl"></span>
    // </div>
    <div className="p-4 space-y-4">
            <Skeleton.Title animated />
            <Skeleton.Paragraph lineCount={5} animated />
          </div>
  );
}