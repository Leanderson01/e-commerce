"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { type signupSchema } from "~/server/api/funcs/auth/auth.types";

type SignUpFormValues = z.infer<typeof signupSchema>;

interface SignUpFormProps {
  form: UseFormReturn<SignUpFormValues>;
  onSubmit: (data: SignUpFormValues) => void;
  isSubmitting: boolean;
}

export function SignUpForm({ form, onSubmit, isSubmitting }: SignUpFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      const fieldsToValidate = [
        "profile.firstName",
        "profile.lastName",
        "email",
        "password",
        "profile.phone",
      ] as const;

      const isValid = await form.trigger(fieldsToValidate);
      return isValid;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Stepper Header */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                currentStep >= 1
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div className="ml-2">
              <p className="text-foreground text-sm font-medium">
                Personal Information
              </p>
            </div>
          </div>
          <div className="bg-muted-foreground h-[1px] w-16"></div>
          <div className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                currentStep >= 2
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <div className="ml-2">
              <p className="text-foreground text-sm font-medium">
                Address Information
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="mt-16 space-y-4">
            <h3 className="text-foreground text-center font-medium">
              Personal information
            </h3>

            <FormField
              control={form.control}
              name="profile.firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-sm">
                    First name*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
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
              name="profile.lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-sm">
                    Last name*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-sm">
                    Email*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
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
                    Password*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
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
              name="profile.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-sm">
                    Phone*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      className="border-border focus:border-ring w-full focus:ring-0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Next Button for Step 1 */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleNext}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 font-medium"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Address Information */}
        {currentStep === 2 && (
          <div className="mt-16 space-y-4">
            <h3 className="text-foreground text-center font-medium">
              Address information
            </h3>

            <FormField
              control={form.control}
              name="profile.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-sm">
                    Postcode / ZIP*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
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
              name="profile.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-sm">
                    State*
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-border focus:border-ring w-full focus:ring-0">
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profile.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-sm">
                    Town / City*
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-border focus:border-ring w-full focus:ring-0">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="los-angeles">Los Angeles</SelectItem>
                      <SelectItem value="new-york">New York</SelectItem>
                      <SelectItem value="houston">Houston</SelectItem>
                      <SelectItem value="miami">Miami</SelectItem>
                      <SelectItem value="sao-paulo">São Paulo</SelectItem>
                      <SelectItem value="rio-de-janeiro">
                        Rio de Janeiro
                      </SelectItem>
                      <SelectItem value="belo-horizonte">
                        Belo Horizonte
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profile.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-sm">
                    Street Address*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="border-border focus:border-ring w-full focus:ring-0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Navigation Buttons for Step 2 */}
            <div className="flex justify-between">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="rounded-md px-6 py-2 font-medium"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Send"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
