import z from "zod";

export const CreateRefreshTokenSchema = z.object({
  userId: z.string().uuid(),
  refreshToken: z.string().min(1),
  expiresAt: z.date(),
});

export type CreateRefreshTokenDto = z.infer<typeof CreateRefreshTokenSchema>;
export type UpdateRefreshTokenDto = z.infer<typeof CreateRefreshTokenSchema>;