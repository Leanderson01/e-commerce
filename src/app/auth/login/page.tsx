"use client";

// import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { api } from "~/trpc/react";
import { loginSchema } from "~/server/api/funcs/auth/auth.types";
import { toast } from "sonner";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  // const router = useRouter();

  const loginMutation = api.auth.form.login.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso");
      // router.push("/");
      // router.refresh();
    },
    onError: (error) => {
      toast.error("Erro ao fazer login", {
        description: error.message,
      });
      console.error("Erro de login:", error);
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Erro de login:", error);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="bg-background dark:bg-background flex w-full flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="seu@email.com" {...field} />
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
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground text-center text-sm">
                Não tem uma conta?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primary font-medium hover:underline"
                >
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
