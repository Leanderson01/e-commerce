"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  updateUserProfileWithPasswordSchema,
  type UpdateUserProfileWithPasswordInput,
} from "~/server/api/funcs/auth/auth.types";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Loader2 } from "lucide-react";

import { useEffect } from "react";

export function AccountDetails() {
  const { data: user, isLoading: userLoading } =
    api.auth.user.getUserLogged.useQuery();

  const updateProfile = api.auth.form.updateUserProfileWithPassword.useMutation(
    {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    },
  );

  const form = useForm<UpdateUserProfileWithPasswordInput>({
    resolver: zodResolver(updateUserProfileWithPasswordSchema),
    defaultValues: {
      firstName: user?.profile?.firstName ?? "",
      lastName: user?.profile?.lastName ?? "",
      phone: user?.profile?.phone ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user?.profile) {
      form.reset({
        firstName: user.profile.firstName ?? "",
        lastName: user.profile.lastName ?? "",
        phone: user.profile.phone ?? "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user?.profile, form]);

  const onSubmit = (data: UpdateUserProfileWithPasswordInput) => {
    updateProfile.mutate(data);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-8 text-center text-xl font-normal text-gray-900 dark:text-white">
        Account details
      </h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            className="text-sm text-gray-600 dark:text-white"
          >
            First name*
          </Label>
          <Input
            id="firstName"
            {...form.register("firstName")}
            className="h-12 rounded-md border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 dark:border-white dark:bg-transparent dark:text-white dark:placeholder:text-gray-400"
            placeholder=""
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label
            htmlFor="lastName"
            className="text-sm text-gray-600 dark:text-white"
          >
            Last name*
          </Label>
          <Input
            id="lastName"
            {...form.register("lastName")}
            className="h-12 rounded-md border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 dark:border-white dark:bg-transparent dark:text-white dark:placeholder:text-gray-400"
            placeholder=""
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email (Disabled) */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm text-gray-600 dark:text-white"
          >
            Email address*
          </Label>
          <Input
            id="email"
            type="email"
            value={user?.email ?? ""}
            disabled
            className="h-12 rounded-md border-gray-300 bg-gray-100 text-gray-500 focus:border-gray-400 focus:ring-0 dark:border-gray-400 dark:bg-gray-800 dark:text-gray-400"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Email cannot be changed
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-sm text-gray-600 dark:text-white"
          >
            Phone
          </Label>
          <Input
            id="phone"
            {...form.register("phone")}
            className="h-12 rounded-md border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 dark:border-white dark:bg-transparent dark:text-white dark:placeholder:text-gray-400"
            placeholder=""
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm text-gray-600 dark:text-white"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            {...form.register("password")}
            className="h-12 rounded-md border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 dark:border-white dark:bg-transparent dark:text-white dark:placeholder:text-gray-400"
            placeholder="Leave empty to keep current password"
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm text-gray-600 dark:text-white"
          >
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            {...form.register("confirmPassword")}
            className="h-12 rounded-md border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 dark:border-white dark:bg-transparent dark:text-white dark:placeholder:text-gray-400"
            placeholder="Confirm your new password"
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-8">
          <Button
            type="submit"
            disabled={updateProfile.isPending}
            className="h-12 w-full rounded-md bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:focus:ring-white"
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "SAVE CHANGES"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
