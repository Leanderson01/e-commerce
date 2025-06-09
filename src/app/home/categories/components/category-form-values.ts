import { z } from "zod";
import { createCategorySchema } from "~/server/api/funcs/category/category.types";

export const categoryFormSchema = z.object({
  name: createCategorySchema.shape.name,
  description: z.string().default("")
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>; 