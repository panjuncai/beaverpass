import { trpc } from '@/lib/trpc/client';
import { GetPresignedUrlInput } from '@/lib/validations/upload';

export const useUpload = () => {
  const uploadMutation = trpc.upload.getPresignedUrl.useMutation();

  const upload = async (input: GetPresignedUrlInput) => {
    try {
      const data = await uploadMutation.mutateAsync(input);

      if (!data.url || !data.fileUrl) {
        throw new Error('Upload failed: Missing URL information');
      }

      return {
        url: data.url,
        fileUrl: data.fileUrl,
      };
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  return {
    upload,
    isLoading: uploadMutation.isLoading,
  };
};
  