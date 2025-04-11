import { createTRPCRouter } from "~/server/api/trpc";
import { reportListRouter } from "./report.list.router";

export const reportRouter = createTRPCRouter({
  list: reportListRouter,
}); 