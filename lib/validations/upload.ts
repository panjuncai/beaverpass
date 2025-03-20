import { z } from 'zod';

// 定义允许的文件类型
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
] as const;

// 最大文件大小 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const getPresignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(ALLOWED_FILE_TYPES, {
    errorMap: () => ({ message: 'Unsupported file type. Only JPEG, PNG, GIF and WebP are allowed.' })
  }),
  fileSize: z.number()
    .max(MAX_FILE_SIZE, 'File size cannot exceed 10MB')
    .nonnegative('File size must be positive'),
});

export type GetPresignedUrlInput = z.infer<typeof getPresignedUrlSchema>;

export interface PresignedUrlResponse {
  url: string;
  fileUrl: string;
}

export { ALLOWED_FILE_TYPES, MAX_FILE_SIZE }; 