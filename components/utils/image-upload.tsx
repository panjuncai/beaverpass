import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import Image from "next/image";

interface ImageUploadProps {
  viewType: "FRONT" | "SIDE" | "BACK" | "DAMAGE";
  imageUrl: string | null|undefined;
  onImageUpload: (viewType: string, file: string) => Promise<void> | void;
  onImageDelete: (viewType: string) => void;
  showError?: boolean;
}

// 添加压缩选项
const compressionOptions = {
  maxSizeMB: 0.1, // 最大文件大小
  maxWidthOrHeight: 1280, // 最大宽度/高度
  useWebWorker: true, // 使用 Web Worker 提高性能
  preserveExif: false, // 保留 EXIF 数据
};

export default function ImageUpload({
  viewType,
  imageUrl,
  onImageUpload,
  onImageDelete,
  showError = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Hidden file input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    void (async () => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          setIsUploading(true);
          setUploadError(null);
          
          const compressedFile = await imageCompression(
            file,
            compressionOptions
          );

          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64String = reader.result as string;
              // 处理异步上传
              await Promise.resolve(onImageUpload(viewType, base64String));
              setIsUploading(false);
            } catch (error) {
              console.error("Error uploading image:", error);
              setUploadError("Upload failed, please try again");
              setIsUploading(false);
            }
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error("Error compressing image:", error);
          setUploadError("Image compression failed");
          setIsUploading(false);
        }
      }
    })();
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    onImageDelete(viewType);
  };

  return (
    <div className="flex flex-col w-full">
    <div className="flex items-center gap-2 w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Image preview area */}
      <div className="relative w-[250px] h-28 bg-gray-100 overflow-hidden rounded">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={`${viewType} View`}
              className="object-cover w-full h-full"
            />
            {/* Overlay text */}
            <div className="absolute bottom-0 w-full text-center bg-black bg-opacity-50 text-white text-xs py-1">
              {viewType} VIEW
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-gray-300">
            <div className="text-xs text-gray-500">{viewType} VIEW</div>
          </div>
        )}
      </div>

      <div className="flex items-start mr-auto gap-2">
        {imageUrl ? (
          <>
            {/* Check mark button */}
            <button className="btn btn-circle btn-success btn-sm text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </button>
            {/* Delete button */}
            <button
              className="btn btn-circle btn-outline btn-error btn-sm"
              onClick={handleDeleteClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </>
        ) : (
          // Upload button
          <button
            className={`btn btn-circle btn-outline btn-sm ${
              isUploading ? "loading" : ""
            }`}
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            )}
          </button>
          
        )}
      </div>
    </div>
    {/* 添加错误提示 */}
    {viewType === "FRONT" && showError && !imageUrl && (
        <div className="text-error text-sm mt-2">
          Please upload a front view image
        </div>
      )}
    {uploadError && (
      <div className="text-error text-sm mt-2">
        {uploadError}
      </div>
    )}
    </div>
  );
}
