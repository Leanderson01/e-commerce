import { createTRPCRouter } from "~/server/api/trpc";
import { cartListRouter } from "./cart.list.router";
import { cartFormRouter } from "./cart.form.router";

export const cartRouter = createTRPCRouter({
  list: cartListRouter,
  form: cartFormRouter,
}); 