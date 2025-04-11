import { createTRPCRouter } from "~/server/api/trpc"
import { productListRouter } from "./product.list.router"
import { productFormRouter } from "./product.form.router"

export const productRouter = createTRPCRouter({
  list: productListRouter,
  form: productFormRouter
}) 