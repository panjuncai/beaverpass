import { PostStatus } from "@/lib/types/enum";
import { GetPostOutput, trpc } from "@/lib/trpc/client";
import Image from "next/image";
import { ChangeEventHandler, useMemo, useState } from "react";
import getPostStatus from "@/utils/tools/getPostStatus";
import RightArrow from "@/components/icons/right-arrow";
import { CenterPopup, Button } from "antd-mobile";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { formatDateTime } from "@/utils/tools/format-time";
import { formatSimpleTime } from "@/utils/tools/format-time";
// import Loading from "@/components/utils/loading";

// 自定义CSS样式
const dayPickerStyles = `
  .rdp {
    --rdp-cell-size: 40px;
    --rdp-accent-color: #733e0a;
    --rdp-background-color: rgba(141, 110, 99, 0.1);
    --rdp-accent-color-dark: #733e0a;
    --rdp-background-color-dark: rgba(141, 110, 99, 0.2);
    margin: 0;
  }
  .rdp-month {
    margin: 0 auto;
  }
  .rdp-caption {
    justify-content: center;
    padding: 0;
    margin-bottom: 12px;
  }
  .rdp-caption_label {
    font-size: 16px;
    font-weight: 600;
  }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: var(--rdp-background-color);
  }
  .rdp-day_selected, 
  .rdp-day_selected:focus-visible, 
  .rdp-day_selected:hover {
    background-color: #733e0a;
    color: white;
  }
  .time-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    border-radius: 10px;
  }
  .time-selector input {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 8px;
    font-size: 16px;
    background-color: white;
  }
  .time-selector span {
    margin: 0 12px;
    color: #666;
  }
  .time-control {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .time-control label {
    font-size: 14px;
    margin-bottom: 6px;
    color: #666;
  }
`;

export default function PostCard({ post }: { post: GetPostOutput }) {
  const utils = trpc.useUtils();
  const [activeAction, setActiveAction] = useState<
    "activate" | "deactivate" | "delete" | null
  >(null);
  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [startTimeValue, setStartTimeValue] = useState<string>("10:00");
  const [endTimeValue, setEndTimeValue] = useState<string>("12:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateOrderPickupTimeMutation =
    trpc.order.updateOrderPickupTime.useMutation({
      onSuccess: () => {
        utils.order.getOrders.invalidate();
        setVisible(false);
        setIsSubmitting(false);
      },
      onError: (error) => {
        setVisible(false);
        setIsSubmitting(false);
        console.error("update order pickup time error:", error);
      },
    });

  // 定义今天的日期用于禁用过去的日期
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // 过滤函数，禁用今天之前的日期
  const isPastDay = useMemo(() => {
    return (date: Date) => {
      return date < today;
    };
  }, [today]);

  // 以下计算可以在提交时使用
  const startDateTime = useMemo(() => {
    if (!selectedDate) return null;
    if (!startTimeValue) return null;
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
    return newStartDate;
  }, [selectedDate, startTimeValue]);

  const endDateTime = useMemo(() => {
    if (!selectedDate) return null;
    if (!endTimeValue) return null;
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
    return newEndDate;
  }, [selectedDate, endTimeValue]);

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

    // 确保不能选择过去的日期
    if (date < today) {
      return;
    }

    setSelectedDate(date);
  };

  const handleSubmitSchedule = () => {
    if (!selectedDate || !startTimeValue || !endTimeValue) {
      return;
    }

    setIsSubmitting(true);
    updateOrderPickupTimeMutation.mutateAsync({
      orderId: post?.orders[0]?.id || "",
      pickupStartTime: startDateTime?.toISOString() || "",
      pickupEndTime: endDateTime?.toISOString() || "",
    });
  };

  return (
    <>
      <style jsx global>
        {dayPickerStyles}
      </style>
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
                {post.orders[0] && (
                  <div className="flex-1 text-right">
                    {post.orders[0].deliveryType}
                  </div>
                )}
              </div>
              <p className="text-xl font-bold mt-2">
                $
                {Number(post.amount) === 0
                  ? "Free"
                  : Number(post.amount).toFixed(2)}
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
              ) : post.status === PostStatus.SOLD ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse-right">
                      <RightArrow color="var(--adm-color-primary)" />
                    </div>
                    <Button
                      className="rounded-full"
                      block
                      size="small"
                      shape="rounded"
                      color="primary"
                      onClick={() => setVisible(true)}
                    >
                      Schedule Pickup
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <div className="flex">
                  <div className="">
                    Pickup Time: 
                  </div>
                  <div className="flex-1 text-right">{formatDateTime(new Date(post.orders[0]?.pickupStartTime || ""))} - {formatSimpleTime(new Date(post.orders[0]?.pickupEndTime || ""))}</div>
                  </div>
        </div>
      </div>
      <CenterPopup
        visible={visible}
        onMaskClick={() => {
          setVisible(false);
        }}
        closeOnMaskClick={true}
      >
        <div className="p-4">
          <h2 className="text-xl font-semibold text-center mb-4">
            Schedule Pickup
          </h2>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            startMonth={new Date()}
            showOutsideDays
            disabled={isPastDay}
            // fromDate={today}
          />

          <div className="time-selector-container">
            <div className="time-selector gap-4">
              <div className="time-control">
                <label>Start Time</label>
                <input
                  type="time"
                  value={startTimeValue}
                  onChange={handleStartTimeChange}
                />
              </div>
              <div className="time-control">
                <label>End Time</label>
                <input
                  type="time"
                  value={endTimeValue}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>
          </div>

          <Button
            className="mt-10 rounded-full"
            block
            size="large"
            color="primary"
            shape="rounded"
            onClick={handleSubmitSchedule}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Confirm Time
          </Button>
        </div>
      </CenterPopup>
    </>
  );
}
