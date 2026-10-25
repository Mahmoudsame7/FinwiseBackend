import z from "zod"

export const CreateCategorySchema = z.object({
    title: z.string()
})

export type UpdateCategoryDto = z.infer<typeof CreateCategorySchema>
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>
