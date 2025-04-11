import { createTRPCRouter } from "~/server/api/trpc";
import { categoryListRouter } from "./category.list.router";
import { categoryFormRouter } from "./category.form.router";

export const categoryRouter = createTRPCRouter({
  list: categoryListRouter,
  form: categoryFormRouter,
}); 