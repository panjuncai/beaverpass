"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { CreatePostSchema, createPostSchema } from "@/lib/validations/post";

export const CreatePostForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
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
    },
  });

  // 使用tRPC创建帖子
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

  // 处理表单提交
  const onSubmit = async (data: CreatePostSchema) => {
    setIsLoading(true);
    setError(null);

    try {
      await createPostMutation.mutateAsync(data);
    } catch {
      // 错误已在onError回调中处理
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};
