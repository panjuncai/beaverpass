import { SerializedPost } from "@/contexts/post-context";

export default function PostDetailMainPostDetail({
  post,
}: {
  post: SerializedPost|null;
}) {
  return (
    <div className="shadow-sm p-2">
      <div className="flex justify-between">
        <div className="text-2xl font-bold">
          {post?.amount === 0 ? "Free" : "$" + post?.amount}{" "}
          <em>{post?.isNegotiable ? "Negotiable" : ""}</em>
        </div>
        <div className="text-sm text-green-600 text-center">
          <div className="badge badge-success text-white">{post?.condition}</div>
        </div>
      </div>

      <p className="text-2xl mt-1 text-gray-700">{post?.description}</p>
    </div>
  );
}
