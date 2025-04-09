import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
// 用户资料更新验证模式
const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  searchRange: z.number().optional(),
  schoolEmail: z.string().optional(),
  schoolEmailVerified: z.boolean().optional(),
});

export const userRouter = router({
  // 获取当前用户信息
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.loginUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not logged in",
      });
    }

    return ctx.loginUser;
  }),

  // 更新用户资料
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient();

        // 获取当前用户数据
        const { data: currentUser, error: fetchError } =
          await supabase.auth.getUser();
        // console.log('🙋‍♀️🙋‍♀️🙋‍♀️currentUser',currentUser);
        if (fetchError) throw fetchError;

        // 获取现有的用户元数据
        const currentMetadata = currentUser.user.user_metadata || {};
        // console.log('🙋‍♀️🙋‍♀️🙋‍♀️currentMetadata',currentMetadata);

        // 创建新的元数据对象，只包含有值的字段
        const newMetadata: Record<string, string | boolean> = {};

        // 检查每个字段，只添加非空值
        if (input.firstName) newMetadata.firstName = input.firstName;
        if (input.lastName) newMetadata.lastName = input.lastName;
        if (input.address) newMetadata.address = input.address;
        if (input.phone) newMetadata.phone = input.phone;
        if (input.avatar) newMetadata.avatar = input.avatar;
        if (input.searchRange)
          newMetadata.searchRange = input.searchRange.toString();
        if (input.schoolEmail) newMetadata.schoolEmail = input.schoolEmail;
        if (input.schoolEmailVerified)
          newMetadata.schoolEmailVerified = input.schoolEmailVerified;
        // console.log('🙋‍♀️🙋‍♀️🙋‍♀️newMetadata',newMetadata);
        // 合并现有元数据和新元数据
        const updatedMetadata = {
          ...currentMetadata,
          ...newMetadata,
        };

        // 更新用户
        const { data, error } = await supabase.auth.updateUser({
          data: updatedMetadata,
        });
        // console.log('🙋‍♀️🙋‍♀️🙋‍♀️data',data);
        if (error) throw error;

        return data;
      } catch (error) {
        console.error("🙀🙀🙀Error updating profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Update profile failed",
        });
      }
    }),
  verifySchoolEmail: protectedProcedure
    .input(
      z.object({
        schoolEmail: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      if (!input.schoolEmail)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "School email is required",
        });
      const supabase = await createClient();
      // 获取当前用户数据
      const { data: currentUser, error: fetchError } =
        await supabase.auth.getUser();
      if (fetchError) throw fetchError;

      // 获取现有的用户元数据
      const currentMetadata = currentUser.user.user_metadata || {};

      // 创建新的元数据对象，只包含有值的字段
      const newMetadata: Record<string, string | boolean | number> = {};

      // 生成验证token
      const verificationSchoolEmailToken = crypto
        .randomBytes(32)
        .toString("hex");
      // 设置24小时后过期
      const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

      newMetadata.schoolEmail = input.schoolEmail;
      newMetadata.verificationSchoolEmailToken = verificationSchoolEmailToken;
      newMetadata.verificationSchoolEmailTokenExpiry = tokenExpiry;

      // 合并现有元数据和新元数据
      const updatedMetadata = {
        ...currentMetadata,
        ...newMetadata,
      };

      // 更新用户
      const { data, error } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });
      if (error) throw error;

      console.log('🙋‍♀️🙋‍♀️🙋‍♀️data',data);

      // 验证邮件链接
      const verifyLink = `${process.env.NEXT_PUBLIC_SITE_URL}/verifySchoolEmail?token=${verificationSchoolEmailToken}`;

      // 配置邮件发送
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "qqxpp0001@gmail.com",
          pass: "xfgo vzop yrvu cego",
        },
      });

      await transporter.sendMail({
        from: "qqxpp0001@gmail.com",
        to: input.schoolEmail,
        subject: "BeaverPass School Email verification",
        html: `<p>Please click the link to verify your School Email.</p>
            <p>The link will expire after 24 hours.</p>
        <a href="${verifyLink}">${verifyLink}</a>`,
      });

      return data;
    }),

  // 验证学校邮箱的token
  verifySchoolEmailToken: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();

      // 获取当前用户数据
      const { data: currentUser, error: fetchError } =
        await supabase.auth.getUser();
      if (fetchError) throw fetchError;

      // 获取现有的用户元数据
      const metadata = currentUser.user.user_metadata || {};

      // 验证token
      if (metadata.verificationSchoolEmailToken !== input.token) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification token",
        });
      }

      // 验证token是否过期
      const tokenExpiry = metadata.verificationSchoolEmailTokenExpiry;
      if (!tokenExpiry || Date.now() > tokenExpiry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification token has expired",
        });
      }

      // 更新用户元数据
      const updatedMetadata = {
        ...metadata,
        schoolEmailVerified: true,
        // 清除验证相关的临时数据
        verificationSchoolEmailToken: undefined,
        verificationSchoolEmailTokenExpiry: undefined,
      };

      // 更新用户
      const { data, error } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });
      if (error) throw error;

      return data;
    }),
});
