import { createTRPCRouter } from "~/server/api/trpc";
import { authFormRouter } from "./auth.form.router";
import { authUserRouter } from "./auth.user.router";

export const authRouter = createTRPCRouter({
  form: authFormRouter,
  user: authUserRouter,
});
