import { PostStatus } from "@/lib/types/enum";
import { SerializedPost } from "@/lib/types/post";
import { trpc } from "@/lib/trpc/client";
import Image from "next/image";
import { ChangeEventHandler, useMemo, useState } from "react";
import getPostStatus from "@/utils/tools/getPostStatus";
import RightArrow from "@/components/icons/right-arrow";
import {CenterPopup} from 'antd-mobile'
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
// import Loading from "@/components/utils/loading";
export default function PostCard({ post }: { post: SerializedPost }) {
  const utils = trpc.useUtils();
  const [activeAction, setActiveAction] = useState<
    "activate" | "deactivate" | "delete" | null
  >(null);
  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date|undefined>(undefined);
  const [startTimeValue, setStartTimeValue] = useState<string>("10:00");
  const [endTimeValue, setEndTimeValue] = useState<string>("12:00");
  const startDateTime=useMemo(()=>{
    if(!selectedDate) return null
    if(!startTimeValue) return null
    const [hours, minutes] = startTimeValue
      .split(":")
      .map((str) => parseInt(str, 10));
    const newStartDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    );
    return newStartDate
  },[selectedDate,startTimeValue])

  const endDateTime=useMemo(()=>{
    if(!selectedDate) return null
    if(!endTimeValue) return null
    const [hours, minutes] = endTimeValue
      .split(":")
      .map((str) => parseInt(str, 10));
    const newEndDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    );
    return newEndDate
  },[selectedDate,endTimeValue])

  const updatePostMutation = trpc.post.updatePost.useMutation({
    onSuccess: () => {
      utils.post.getPosts.invalidate();
      setActiveAction(null); // 重置状态
    },
  });

  const handleStatusChange = async (
    newStatus: (typeof PostStatus)[keyof typeof PostStatus]
  ) => {
    try {
      // 设置当前正在执行的操作
      if (newStatus === PostStatus.ACTIVE) {
        setActiveAction("activate");
      } else if (newStatus === PostStatus.INACTIVE) {
        setActiveAction("deactivate");
      } else if (newStatus === PostStatus.DELETED) {
        setActiveAction("delete");
      }

      await updatePostMutation.mutateAsync({ id: post.id, status: newStatus });
    } catch (error) {
      console.log("update post statuserror", error);
      setActiveAction(null); // 发生错误时重置状态
    }
  };

  const handleStartTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    // const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    // const newSelectedDate = setHours(setMinutes(selectedDate, minutes), hours);
    // setSelectedDate(newSelectedDate);
    setStartTimeValue(time);
  };

  const handleEndTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    setEndTimeValue(time);
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(date);
      return;
    }
    const [hours, minutes] = startTimeValue
      .split(":")
      .map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    setSelectedDate(newDate);
  };

  return (
    <>
    <div className="card bg-base-100 shadow-md mb-4">
      <div className="card-body">
        <div className="flex items-center gap-4">
          <Image
            src={post.images?.[0]?.imageUrl || ""}
            alt={post.title}
            className="w-24 h-24 object-cover rounded-lg"
            width={96}
            height={96}
          />
          <div className="flex-1">
            <h3 className="card-title">{post.title}</h3>
            <div className="flex items-center">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPostStatus(
                  post.status || ""
                )}`}
              >
                {post.status}
              </div>
              {post.order && (
                <div className="flex-1 text-right">
                  {post.order.delivery_type}
                </div>
              )}
            </div>
            <p className="text-xl font-bold mt-2">
              ${post.amount === 0 ? "Free" : Number(post.amount).toFixed(2)}
              {post.isNegotiable && (
                <span className="text-sm ml-2">Negotiable</span>
              )}
            </p>
          </div>
        </div>
        <div className="divider my-2"></div>
        <div className="flex justify-between items-center text-sm">
          <span>
            Posted: {new Date(post.createdAt || "").toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            {post.status === PostStatus.ACTIVE ? (
              <>
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => void handleStatusChange(PostStatus.INACTIVE)}
                  disabled={activeAction !== null}
                >
                  {activeAction === "deactivate" ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Deactivate"
                  )}
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => void handleStatusChange(PostStatus.DELETED)}
                  disabled={activeAction !== null}
                >
                  {activeAction === "delete" ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </>
            ) : post.status === PostStatus.INACTIVE ? (
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => void handleStatusChange(PostStatus.ACTIVE)}
                  disabled={activeAction !== null}
                >
                  {activeAction === "activate" ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Activate"
                  )}
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => void handleStatusChange(PostStatus.DELETED)}
                  disabled={activeAction !== null}
                >
                  {activeAction === "delete" ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </>
            ) : post.status===PostStatus.SOLD? (<div className="flex items-center gap-2">
              <div className="animate-pulse-right">
                <RightArrow color="var(--adm-color-primary)"/>
              </div>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setVisible(true)}
              >
                Schedule Pickup
              </button>
            </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
    <CenterPopup
    visible={visible}
    onMaskClick={() => {
      setVisible(false)
    }}
  >
   <div>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleDaySelect}
        footer={`${startDateTime?.toLocaleString()} - ${endDateTime?.toLocaleString()}`}
      />
      <form style={{ marginBlockEnd: "1em" }}>
        <label>
          Start time:{" "}
          <input type="time" value={startTimeValue} onChange={handleStartTimeChange} />
        </label>
        -
        <label>
          End time:{" "}
          <input type="time" value={endTimeValue} onChange={handleEndTimeChange} />
        </label>
      </form>
    </div>
  </CenterPopup>
    </>
  );
}
