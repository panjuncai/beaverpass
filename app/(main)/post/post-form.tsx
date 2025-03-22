"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { CreatePostSchema, createPostSchema } from "@/lib/validations/post";
import ImageUpload from "../../../components/utils/image-upload";
import { useFileUpload } from "@/hooks/useFileUpload";

export const CreatePostForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { uploadBase64Image } = useFileUpload();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePostSchema>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      condition: "",
      amount: 0,
      isNegotiable: false,
      deliveryType: "",
      images: [],
    },
  });

  // 监听 images 字段的变化
  const images = watch("images");

  // 处理图片上传
  const handleImageUpload = async (viewType: string, base64String: string) => {
    try {
      const fileName = `post_${new Date().getTime()}_${viewType}.jpg`;
      const imageUrl = await uploadBase64Image(base64String, fileName);
      
      // 使用 setValue 更新 images 数组，但不触发验证
      setValue("images", [
        ...images,
        {
          imageUrl,
          imageType: viewType,
        }
      ], { shouldValidate: false });  // 改为 false，不立即触发验证
      
      // 清除可能存在的错误信息
      setError(null);
      
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      setError("Failed to upload image");
    }
  };

  const handleImageDelete = (viewType: string) => {
    // 使用 setValue 删除指定类型的图片，但不触发验证
    setValue(
      "images",
      images.filter((img) => img.imageType !== viewType),
      { shouldValidate: false }  // 改为 false，不立即触发验证
    );
  };

  // 处理表单提交
  const createPostMutation = trpc.post.createPost.useMutation({
    onSuccess: (data) => {
      console.log("Post created:", data);
      router.push("/search");
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: CreatePostSchema) => {
    console.log('onSubmit called with data:', data);
    
    if (data.images.length === 0) {
      setError('At least one image is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createPostMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error in onSubmit:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* {Object.values(errors).length > 0 && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {Object.values(errors).map((error) => (
            <p key={error.message}>{error.message}</p>
          ))}
        </div>
      )} */}
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-4"
      >
        <input
          id="category"
          placeholder="Category"
          required
          {...register("category")}
          className="border p-2 w-full"
        />
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
        )}
        <input
          id="title"
          placeholder="Title"
          required
          {...register("title")}
          className="border p-2 w-full"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
        <textarea
          id="description"
          placeholder="Description (max 500 chars)"
          required
          {...register("description")}
          maxLength={500}
          className="border p-2 w-full"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
        <input
          id="condition"
          placeholder="Condition"
          required
          {...register("condition")}
          className="border p-2 w-full"
        />
        {errors.condition && (
          <p className="mt-1 text-sm text-red-500">
            {errors.condition.message}
          </p>
        )}
        <input
          id="amount"
          type="number"
          placeholder="Amount"
          required
          min={0}
          step={0.01}
          {...register("amount")}
          className="border p-2 w-full"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
        )}
        <label className="flex items-center gap-2">
          <input
            id="isNegotiable"
            type="checkbox"
            {...register("isNegotiable")}
          />
          Negotiable
        </label>
        {errors.isNegotiable && (
          <p className="mt-1 text-sm text-red-500">
            {errors.isNegotiable.message}
          </p>
        )}
        <input
          id="deliveryType"
          placeholder="Delivery Type"
          required
          {...register("deliveryType")}
          className="border p-2 w-full"
        />

        <div className="w-full">
          <ImageUpload
            viewType="FRONT"
            imageUrl={images.find(img => img.imageType === "FRONT")?.imageUrl}
            onImageUpload={handleImageUpload}
            onImageDelete={handleImageDelete}
          />
        </div>

        {errors.images && (
          <p className="mt-1 text-sm text-red-500">
            {errors.images.message}
          </p>
        )}

        <button
          className="btn btn-primary w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Posting..." : "Post"}
        </button>
      </form>
      <div className="h-300"></div>
    </div>
  );
};

