import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().nonnegative(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;