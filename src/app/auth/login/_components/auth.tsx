"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { env } from "~/env";
import type { ZodType } from "zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { api } from "~/trpc/react";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "~/server/api/funcs/auth/auth.types";

import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

export function AuthForm() {
  const router = useRouter();

  // Login form
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema as ZodType<SignupInput>),
    defaultValues: {
      email: "",
      password: "",
      role: "client",
      profile: {
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
    },
  });

  // Login mutation
  const loginMutation = api.auth.form.login.useMutation({
    onSuccess: async (data) => {
      if (data.session) {
        const supabase = createBrowserClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        );

        const { error } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (error) {
          console.error("Error setting session:", error);
          toast.error("Error setting session");
          return;
        }
      }

      toast.success("Login successful");
      router.push("/home/profile");
    },
    onError: (error) => {
      toast.error("Login error", {
        description: error.message,
      });
      console.error("Login error:", error);
    },
  });

  const signupMutation = api.auth.form.signup.useMutation({
    onSuccess: async () => {
      toast.success(
        "Account created successfully! Please check your email to verify your account.",
      );
      signupForm.reset();

      // router.push("/home/profile");
    },
    onError: (error) => {
      toast.error("Signup error", {
        description: error.message,
      });
      console.error("Signup error:", error);
    },
  });

  async function handleSignIn(data: LoginInput) {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  async function handleSignUp(data: SignupInput) {
    try {
      await signupMutation.mutateAsync(data);
    } catch (error) {
      console.error("Signup error:", error);
    }
  }

  return (
    <div className="bg-background mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-8 rounded-lg border p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-foreground text-2xl font-medium">My account</h1>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="bg-muted mb-8 grid w-full grid-cols-2 rounded-md p-1">
          <TabsTrigger
            value="signin"
            className="data-[state=active]:bg-background cursor-pointer text-sm font-medium data-[state=active]:shadow-sm"
          >
            Sign in
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="data-[state=active]:bg-background cursor-pointer text-sm font-medium data-[state=active]:shadow-sm"
          >
            Register
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-6">
          <SignInForm
            form={loginForm}
            onSubmit={handleSignIn}
            isSubmitting={loginMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="register" className="space-y-6">
          <SignUpForm
            form={signupForm}
            onSubmit={handleSignUp}
            isSubmitting={signupMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
