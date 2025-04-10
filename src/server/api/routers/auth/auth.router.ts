import { createTRPCRouter } from "~/server/api/trpc"
import { authFormRouter } from "./auth.form.router"

export const authRouter = createTRPCRouter({
  form: authFormRouter
}) 