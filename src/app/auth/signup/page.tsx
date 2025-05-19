"use client"

import { SignupForm } from "./components/signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="bg-background dark:bg-background flex w-full flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </div>
  )
} 