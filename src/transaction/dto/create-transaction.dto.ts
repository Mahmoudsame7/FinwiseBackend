import z from "zod";
import { TransactionType } from "../entities/transaction.entity";
import { CreateAccountSchema } from "src/account/dto/create-account.dto";

export enum TransactionPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ALL = 'all'
}


export const CreateTransactionSchema = z.object({
    accountId: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    amount: z.number().positive().nullable().optional(),
    type: z.enum(TransactionType).nullable().optional(),
    categoryId: z.string().nullable().optional(),
    note: z.string().optional().nullable().optional(),
    transactionTime: z.string().nullable().optional()
})



export const SearchTransactionsSchema = z.object({
  categoryId: z.string().nullable().optional(),
  accountId: z.string().nullable().optional(),
  type:z.enum(TransactionType).nullable().optional(),
  date: z.string().optional(),
  searchTerm: z.string().nullable().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const GetTransactionsSchema = z.object({
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  type:z.enum(TransactionType).optional(),
  period: z.enum(TransactionPeriod).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const GetTransactionsSummarySchema = z.object({
  period: z.enum(TransactionPeriod),
});

export const  UpdateTransactionSchema = CreateTransactionSchema.partial()


export type SearchTransactionsDto = z.infer<typeof SearchTransactionsSchema>
export type GetTransactionSummaryDto = z.infer<typeof GetTransactionsSummarySchema>
export type GetTransactionDto = z.infer<typeof GetTransactionsSchema>
export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>