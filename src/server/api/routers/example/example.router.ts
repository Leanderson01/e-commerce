import { createTRPCRouter } from "../../../trpc"
import { locationsFormRouter } from "./example.form.router"
import { locationsListRouter } from "./example.list.router"

export const locationsRouter = createTRPCRouter({
  list: locationsListRouter,
  form: locationsFormRouter
})
