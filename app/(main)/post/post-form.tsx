"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { CreatePostInput, createPostSchema } from "@/lib/validations/post";
import ImageUpload from "@/components/utils/image-upload";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { PostCategory, PostCondition, DeliveryType } from "@/lib/types/enum";

import { useAuthStore } from "@/lib/store/auth-store";

// 枚举映射
const CATEGORY_OPTIONS = [
  { value: PostCategory.LIVING_ROOM_FURNITURE, label: "Living Room Furniture" },
  { value: PostCategory.BEDROOM_FURNITURE, label: "Bedroom Furniture" },
  { value: PostCategory.DINING_ROOM_FURNITURE, label: "Dining Room Furniture" },
  { value: PostCategory.OFFICE_FURNITURE, label: "Office Furniture" },
  { value: PostCategory.OUTDOOR_FURNITURE, label: "Outdoor Furniture" },
  { value: PostCategory.STORAGE, label: "Storage" },
  { value: PostCategory.OTHER, label: "Other" },
];

const CONDITION_OPTIONS = [
  { value: PostCondition.LIKE_NEW, label: "Like New" },
  { value: PostCondition.GENTLY_USED, label: "Gently Used" },
  { value: PostCondition.MINOR_SCRATCHES, label: "Minor Scratches" },
  { value: PostCondition.STAINS, label: "Stains" },
  { value: PostCondition.NEEDS_REPAIR, label: "Needs Repair" },
];

const DELIVERY_OPTIONS = [
  {
    value: DeliveryType.HOME_DELIVERY,
    label: "Home Delivery (via third-party service)",
  },
  { value: DeliveryType.PICKUP, label: "Pickup by Buyer" },
  { value: DeliveryType.BOTH, label: "Both Options" },
];

export default function PostForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const { uploadBase64Image } = useFileUpload();
  const { loginUser } = useAuthStore();
  // 为每个视图添加单独的上传状态
  const [uploadingStates, setUploadingStates] = useState<{[key: string]: boolean}>({
    FRONT: false,
    SIDE: false,
    BACK: false,
    DAMAGE: false
  });

  // 更新单个视图的上传状态
  const setViewUploadingState = (viewType: string, isUploading: boolean) => {
    setUploadingStates(prev => ({
      ...prev,
      [viewType]: isUploading
    }));
  };

  // 使用useForm进行表单管理和验证
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    getValues,
    trigger,
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      category: PostCategory.LIVING_ROOM_FURNITURE,
      title: "",
      description: "",
      condition: PostCondition.LIKE_NEW,
      amount: 0,
      isNegotiable: false,
      deliveryType: DeliveryType.HOME_DELIVERY,
      images: [],
    },
  });

  // 监听表单字段
  const images = watch("images");
  const isFree = watch("amount") === 0;
  const category = watch("category");
  const condition = watch("condition");
  const deliveryType = watch("deliveryType");
  const isNegotiable = watch("isNegotiable");

  // 处理图片上传
  const handleImageUpload = async (viewType: string, base64String: string): Promise<void> => {
    try {
      // 不需要手动设置上传状态，由ImageUpload组件通过setUploadingState回调管理
      
      const fileName = `post_${
        loginUser?.id || new Date().getTime()
      }_${viewType}.jpg`;
      const imageUrl = await uploadBase64Image(base64String, fileName);

      // 更新images数组
      const currentImages = getValues("images");
      const filteredImages = currentImages.filter(
        (img) => img.imageType !== viewType
      );

      setValue(
        "images",
        [
          ...filteredImages,
          {
            imageUrl,
            imageType: viewType,
          },
        ],
        { shouldValidate: false }
      );

      setFormError(null);
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      setFormError("Failed to upload image");
      throw error;
    }
  };

  const handleImageDelete = (viewType: string) => {
    setValue(
      "images",
      images.filter((img) => img.imageType !== viewType),
      { shouldValidate: false }
    );
  };

  // 格式化价格
  const formatPrice = (value: string) => {
    // 移除非数字和小数点
    let formattedValue = value.replace(/[^\d.]/g, "");

    // 确保只有一个小数点
    const parts = formattedValue.split(".");
    if (parts.length > 2) {
      formattedValue = parts[0] + "." + parts.slice(1).join("");
    }

    // 如果是以小数点开始，添加前导零
    if (formattedValue.startsWith(".")) {
      formattedValue = "0" + formattedValue;
    }

    // 限制小数位数为两位
    if (parts.length > 1 && parts[1].length > 2) {
      formattedValue = parts[0] + "." + parts[1].slice(0, 2);
    }

    return formattedValue;
  };

  // 处理价格变更
  const handlePriceChange = (updates: {
    amount?: string;
    isNegotiable?: boolean;
  }) => {
    if (updates.amount !== undefined) {
      const amount = updates.amount === "" ? 0 : parseFloat(updates.amount);
      setValue("amount", amount);
    }

    if (updates.isNegotiable !== undefined) {
      setValue("isNegotiable", updates.isNegotiable);
    }
  };

  // 创建帖子的TRPC mutation
  const createPostMutation = trpc.post.createPost.useMutation({
    onSuccess: () => {
      router.push("/search");
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      setFormError(error.message);
    },
  });

  // 表单提交
  const onSubmit = async (data: CreatePostInput) => {
    try {
      // 检查是否有图片上传
      if (data.images.length === 0) {
        setFormError("At least one image is required");
        setCurrentStep(3); // 返回到图片上传步骤
        return;
      }

      setFormError(null);
      console.log("Submitting data:", data);
      await createPostMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      // 让错误在 mutation 的 onError 中处理
    }
  };

  // 在最后一步点击发布按钮的处理
  const handlePublish = async () => {
    const isValid = await trigger(); // 触发所有字段的验证
    if (isValid) {
      const data = getValues(); // 获取所有表单数据
      await onSubmit(data);
    } else {
      setFormError("Please check the form for errors");
    }
  };

  // 步骤验证和导航
  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 0: // 分类
        isValid = await trigger("category");
        break;
      case 1: // 描述
        isValid = await trigger(["title", "description"]);
        break;
      case 2: // 条件
        isValid = await trigger("condition");
        break;
      case 3: // 图片
        isValid = images.some((img) => img.imageType === "FRONT");
        if (!isValid) {
          setFormError("Front image is required");
        }
        break;
      case 4: // 价格
        isValid = await trigger("amount");
        break;
      case 5: // 配送选项
        isValid = await trigger("deliveryType");
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        void handleSubmit(onSubmit)();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 步骤内容组件
  const StepOne = () => (
    <>
      <div className="flex justify-center mt-6 text-yellow-900 text-xl font-semibold font-['Poppins']">
        Step 1: Choose a Category
      </div>
      <div className="flex justify-center mt-4">
        <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box w-64">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title text-xl font-semibold flex items-center justify-between text-gray-400">
            Category
          </div>
          <div className="collapse-content p-0">
            <ul className="menu bg-base-100 w-full text-lg">
              {CATEGORY_OPTIONS.map((option) => (
                <li
                  key={option.value}
                  className={category === option.value ? "bg-[#7EAC2D]" : ""}
                >
                  <a
                    className={
                      category === option.value
                        ? "text-white !important"
                        : "nav-link"
                    }
                    style={
                      category === option.value ? { color: "white" } : undefined
                    }
                    onClick={() => setValue("category", option.value)}
                  >
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {errors.category && (
        <div className="text-error text-sm mt-2">{errors.category.message}</div>
      )}
    </>
  );

  const StepTwo = () => {
    const description = getValues("description") || "";
    const [charCount, setCharCount] = useState(description.length);

    const handleDescriptionChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      const value = e.target.value;
      setValue("description", value);
      setCharCount(value.length);
    };

    return (
      <>
        <div className="flex justify-center mt-6 text-yellow-900 text-xl font-semibold font-['Poppins']">
          Step 2: Describe Your Item
        </div>
        <div className="p-6">
          <div className="flex justify-center mt-4">
            <label className="input input-bordered flex items-center gap-2 w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="w-2 h-2"
              >
                <rect width="256" height="256" fill="none" />
                <line
                  x1="128"
                  y1="40"
                  x2="128"
                  y2="216"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
                <line
                  x1="48"
                  y1="80"
                  x2="208"
                  y2="176"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
                <line
                  x1="48"
                  y1="176"
                  x2="208"
                  y2="80"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
              </svg>
              <input
                type="text"
                className="grow"
                placeholder="Title"
                {...register("title")}
              />
            </label>
          </div>
          {errors.title && (
            <div className="text-error text-sm mt-2">
              {errors.title.message}
            </div>
          )}
          <div className="flex flex-col items-center mt-4">
            <label className="input input-bordered flex items-start gap-2 w-full h-48">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="w-2 h-2 mt-4"
              >
                <rect width="256" height="256" fill="none" />
                <line
                  x1="128"
                  y1="40"
                  x2="128"
                  y2="216"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
                <line
                  x1="48"
                  y1="80"
                  x2="208"
                  y2="176"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
                <line
                  x1="48"
                  y1="176"
                  x2="208"
                  y2="80"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
              </svg>
              <textarea
                className="grow h-full resize-none bg-transparent border-none outline-none pt-1"
                placeholder={`Description
E.g., Solid wood dining table with minor scratches on the top surface. Dimensions: 120cm x 80cm.
              `}
                maxLength={500}
                defaultValue={getValues("description")}
                onChange={handleDescriptionChange}
              ></textarea>
            </label>
            <div className="flex w-full mt-2">
              <span className="label-text-alt">{charCount}/500 characters</span>
            </div>
          </div>
          {errors.description && (
            <div className="text-error text-sm mt-2">
              {errors.description.message}
            </div>
          )}
        </div>
      </>
    );
  };

  const StepThree = () => (
    <>
      <div className="flex justify-center mt-6 text-yellow-900 text-xl font-semibold font-['Poppins']">
        Step 3: Select Condition
      </div>
      <div className="flex justify-center mt-4">
        <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box w-64">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title text-xl font-semibold flex items-center justify-between text-gray-400">
            Item Condition
          </div>
          <div className="collapse-content p-0">
            <ul className="menu bg-base-100 w-full text-lg">
              {CONDITION_OPTIONS.map((option) => (
                <li
                  key={option.value}
                  className={condition === option.value ? "bg-[#7EAC2D]" : ""}
                >
                  <a
                    className={
                      condition === option.value ? "text-white" : "nav-link"
                    }
                    style={
                      condition === option.value
                        ? { color: "white" }
                        : undefined
                    }
                    onClick={() => setValue("condition", option.value)}
                  >
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {errors.condition && (
        <div className="text-error text-sm mt-2">
          {errors.condition.message}
        </div>
      )}
    </>
  );

  const StepFour = () => (
    <>
      <div className="flex justify-center mt-6 text-yellow-900 text-xl font-semibold font-['Poppins']">
        Step 4: Add Photos
      </div>
      <div className="flex justify-center mt-4">
        <div className="pl-12 space-y-6 w-full">
          <ImageUpload
            viewType="FRONT"
            imageUrl={images.find((img) => img.imageType === "FRONT")?.imageUrl}
            onImageUpload={handleImageUpload}
            onImageDelete={handleImageDelete}
            showError={
              !images.some((img) => img.imageType === "FRONT") &&
              formError?.includes("Front image")
            }
            uploading={uploadingStates.FRONT}
            setUploadingState={(isUploading: boolean) => setViewUploadingState("FRONT", isUploading)}
          />
          <ImageUpload
            viewType="SIDE"
            imageUrl={images.find((img) => img.imageType === "SIDE")?.imageUrl}
            onImageUpload={handleImageUpload}
            onImageDelete={handleImageDelete}
            uploading={uploadingStates.SIDE}
            setUploadingState={(isUploading: boolean) => setViewUploadingState("SIDE", isUploading)}
          />
          <ImageUpload
            viewType="BACK"
            imageUrl={images.find((img) => img.imageType === "BACK")?.imageUrl}
            onImageUpload={handleImageUpload}
            onImageDelete={handleImageDelete}
            uploading={uploadingStates.BACK}
            setUploadingState={(isUploading: boolean) => setViewUploadingState("BACK", isUploading)}
          />
          <ImageUpload
            viewType="DAMAGE"
            imageUrl={
              images.find((img) => img.imageType === "DAMAGE")?.imageUrl
            }
            onImageUpload={handleImageUpload}
            onImageDelete={handleImageDelete}
            uploading={uploadingStates.DAMAGE}
            setUploadingState={(isUploading: boolean) => setViewUploadingState("DAMAGE", isUploading)}
          />
        </div>
      </div>
      {errors.images && (
        <div className="text-error text-sm mt-2">{errors.images.message}</div>
      )}
      <div className="h-30"></div>
    </>
  );

  const StepFive = () => {
    const [localAmount, setLocalAmount] = useState((watch("amount") || "").toString());
    
    const handleLocalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = formatPrice(e.target.value);
      setLocalAmount(value);
    };
    
    const handleAmountBlur = () => {
      if (localAmount === "") {
        setLocalAmount("0");
        handlePriceChange({ amount: "0" });
      } else {
        handlePriceChange({ amount: localAmount });
      }
    };
    
    // 当表单值改变时更新本地状态
    useEffect(() => {
      setLocalAmount((watch("amount") || "").toString());
    }, [watch("amount")]);
    
    return (
      <>
        <div className="flex justify-center mt-6 text-yellow-900 text-xl font-semibold font-['Poppins']">
          Step 5: Set Your Price
        </div>
        <div className="flex flex-col justify-center mt-4 p-8">
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="radio"
                name="price-type"
                className="radio checked:bg-primary"
                checked={!isFree}
                onChange={() => setValue("amount", isFree ? "" : 0)}
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Price"
                  className="input input-bordered w-full max-w-xs"
                  value={isFree ? "0" : localAmount}
                  onChange={handleLocalAmountChange}
                  onBlur={handleAmountBlur}
                  disabled={isFree}
                />
              </div>
            </label>
            {errors.amount && (
              <div className="text-error text-sm mt-2">
                {errors.amount.message}
              </div>
            )}
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-6">
              <input
                type="radio"
                name="price-type"
                className="radio checked:bg-primary"
                checked={isFree}
                onChange={() => setValue("amount", isFree ? "" : 0)}
              />
              <span className="label-text text-lg">Free</span>
            </label>
          </div>
          <hr className="border-gray-200 mt-4" />
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-6">
              <input
                type="checkbox"
                className="checkbox"
                checked={isNegotiable}
                onChange={(e) =>
                  handlePriceChange({ isNegotiable: e.target.checked })
                }
                disabled={isFree}
              />
              <span className="label-text text-lg">Price is negotiable</span>
            </label>
          </div>
        </div>
      </>
    );
  };

  const StepSix = () => (
    <>
      <div className="flex justify-center mt-6 text-yellow-900 text-xl font-semibold font-['Poppins']">
        Step 6: Choose Delivery Options
      </div>
      <div className="flex flex-col justify-center mt-4 p-8">
        {DELIVERY_OPTIONS.map((option) => (
          <div className="form-control" key={option.value}>
            <label className="label cursor-pointer justify-start gap-6">
              <input
                type="radio"
                name="delivery-type"
                className="radio checked:bg-primary"
                checked={deliveryType === option.value}
                onChange={() => setValue("deliveryType", option.value)}
              />
              <span className="label-text text-lg">{option.label}</span>
            </label>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-primary"
            viewBox="0 0 256 256"
          >
            <rect width="256" height="256" fill="none" />
            <path
              d="M96,192a32,32,0,0,0,64,0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            />
            <path
              d="M184,24a102.71,102.71,0,0,1,36.29,40"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            />
            <path
              d="M35.71,64A102.71,102.71,0,0,1,72,24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            />
            <path
              d="M56,112a72,72,0,0,1,144,0c0,35.82,8.3,56.6,14.9,68A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,147.81,56,112Z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            />
          </svg>
          <span className="text-gray-400 text-md">
            Choose the delivery methods you can offer. Delivery services may
            charge extra.
          </span>
        </div>
        {errors.deliveryType && (
          <div className="text-error text-sm mt-2">
            {errors.deliveryType.message}
          </div>
        )}
      </div>
    </>
  );

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepOne />;
      case 1:
        return <StepTwo />;
      case 2:
        return <StepThree />;
      case 3:
        return <StepFour />;
      case 4:
        return <StepFive />;
      case 5:
        return <StepSix />;
      default:
        return null;
    }
  };

  // 表单页面内容
  const FormContent = () => (
    <div>
      {/* Step indicators */}
      <div className="flex justify-center overflow-hidden mt-6 mb-4">
        <div className="w-full px-4 flex items-center justify-between max-w-md relative">
          {/* Connecting lines (behind the circles) */}
          <div className="absolute top-4 left-10 right-10 h-[1px] bg-gray-300"></div>
          <div
            className="absolute top-4 left-10 right-10 h-[1px] bg-lime-600"
            style={{ width: `${Math.min(100, currentStep * 20)}%` }}
          ></div>

          {/* Step circles */}
          {[1, 2, 3, 4, 5, 6].map((stepNum, index) => (
            <div key={index} className="flex flex-col items-center z-10">
              <div className="relative">
                {/* Circle with border */}
                <div
                  className={`w-8 h-8 rounded-full border-2 ${
                    index <= currentStep ? "border-lime-600" : "border-gray-400"
                  } flex items-center justify-center bg-white relative`}
                >
                  {/* Inner dot for current step */}
                  {index === currentStep && (
                    <div className="w-2.5 h-2.5 bg-lime-600 rounded-full"></div>
                  )}
                  {/* Checkmark for completed steps - green background with white checkmark */}
                  {index < currentStep && (
                    <div className="w-8 h-8 bg-lime-600 rounded-full flex items-center justify-center absolute inset-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  {/* Gray dot for unfinished steps */}
                  {index > currentStep && (
                    <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Step number */}
              <div
                className={`mt-2 text-sm ${
                  index <= currentStep
                    ? "text-lime-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                {stepNum}
              </div>
            </div>
          ))}
        </div>
      </div>

      {renderStepContent()}

      {/* 导航按钮 */}
      <div className="fixed bottom-16 left-0 right-0 flex justify-center mt-8">
        <div className="flex items-center gap-4 w-full max-w-md px-4 justify-center">
          <button
            className={`h-12 relative bg-white border-2 border-yellow-900 rounded-3xl text-center text-yellow-900 text-base font-semibold font-['Poppins'] transition-all duration-300 hover:bg-gray-100 shadow-md ${
              currentStep === 0 ? "hidden" : "w-36 md:w-40"
            }`}
            onClick={handlePrevious}
            disabled={isSubmitting}
          >
            Previous
          </button>
          <button
            className={`h-12 relative bg-yellow-900 rounded-3xl text-center text-white text-base font-semibold font-['Poppins'] transition-all duration-300 hover:bg-yellow-800 shadow-md ${
              currentStep === 0 ? "w-64 md:w-80" : "w-36 md:w-40"
            }`}
            onClick={currentStep === 5 ? handlePublish : handleNext}
            disabled={isSubmitting || createPostMutation.isLoading}
          >
            {currentStep === 5 ? (
              isSubmitting || createPostMutation.isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Publish"
              )
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return  (
    <div className="flex flex-col h-full">
      <FormContent />
    </div>
  ) 
}
