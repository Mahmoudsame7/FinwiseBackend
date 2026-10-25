import z from "zod";

export const RefreshRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});


export type RefreshRefreshTokenDto = z.infer<typeof RefreshRefreshTokenSchema>; 