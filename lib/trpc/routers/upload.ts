import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '..';
import { getPresignedUrlSchema } from '@/lib/validations/upload';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadRouter = router({
  getPresignedUrl: protectedProcedure
    .input(getPresignedUrlSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const key = `beaverpass-${timestamp}-${randomString}-${input.fileName}`;
        
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: key,
          ContentType: input.fileType,
          Metadata: {
            uploadedBy: ctx.user.id,
            originalName: input.fileName,
          },
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        console.log('fileUrl', fileUrl)
        console.log('Generated presigned URL for file:', {
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          userId: ctx.user.id,
        });

        return {
          url: presignedUrl,
          fileUrl,
        };
      } catch (error) {
        console.error('Error generating presigned URL:', error);
        
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to generate presigned URL: ${error.message}`,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate presigned URL',
        });
      }
    }),
}); 