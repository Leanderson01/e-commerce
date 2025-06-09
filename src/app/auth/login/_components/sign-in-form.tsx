"use client";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { type loginSchema } from "~/server/api/funcs/auth/auth.types";

type LoginFormValues = z.infer<typeof loginSchema>;

interface SignInFormProps {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (data: LoginFormValues) => void;
  isSubmitting: boolean;
}

export function SignInForm({ form, onSubmit, isSubmitting }: SignInFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground text-sm">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="border-border focus:border-ring w-full focus:ring-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground text-sm">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  className="border-border focus:border-ring w-full focus:ring-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" className="border-border" />
          <label
            htmlFor="remember"
            className="text-muted-foreground cursor-pointer text-sm"
          >
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-3 font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground cursor-pointer text-sm underline"
            onClick={() => console.log("Forgot password clicked")}
          >
            Have you forgotten your password?
          </button>
        </div>
      </form>
    </Form>
  );
}
