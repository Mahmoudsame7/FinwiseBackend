import z from "zod";
import { AccountType } from "../entities/account.entity";

export const CreateAccountSchema = z.object({
    name: z.string(),
    type: z.enum(AccountType),
    initialBalance: z.number().min(0),
    balance: z.number().min(0),
})

// export const UpdateAccountSchema = z.object({
//   type: z.enum(AccountType).optional(),
//   initialBalance: z.number().min(0).optional(),
// });

export const UpdateAccountSchema = CreateAccountSchema.partial()

export type UpdateAccountDto  = z.infer<typeof UpdateAccountSchema>
export type CreateAccountDto  = z.infer<typeof CreateAccountSchema>
