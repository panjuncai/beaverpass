import { useState } from 'react';
import { useUpload } from '@/hooks/useUpload'; // 你现有的 GraphQL 上传 Hook

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { upload } = useUpload();

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    setError(null);
    
    try {
      const { url, fileUrl } = await upload({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      // 使用预签名 URL 上传文件
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // 返回可访问的文件 URL
      return fileUrl;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      setError(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      const error = new Error('Only image files can be uploaded');
      setError(error);
      throw error;
    }
    
    return uploadFile(file);
  };

  const uploadBase64Image = async (base64Data: string, fileName: string): Promise<string> => {
    // 从 Base64 创建 Blob
    const byteString = atob(base64Data.split(',')[1]);
    const mimeType = base64Data.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
    
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([arrayBuffer], { type: mimeType });
    const file = new File([blob], fileName, { type: mimeType });
    
    return uploadImage(file);
  };

  return {
    uploadFile,
    uploadImage,
    uploadBase64Image,
    isUploading,
    error
  };
} 