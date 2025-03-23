import { Post as PrismaPost } from "@prisma/client";

export type SerializedPost = Omit<PrismaPost, 'amount'> & {
  amount: number;
  images: { 
    id: string; 
    createdAt: Date | null; 
    imageUrl: string; 
    imageType: string | null; 
    postId: string; 
  }[];
  poster: { 
    id: string; 
    email: string; 
    firstName: string | null; 
    lastName: string | null; 
    avatar: string | null; 
    phone: string | null;
    address: string | null;
    createdAt: Date | null; 
    updatedAt: Date | null; 
  } | null;
}; 