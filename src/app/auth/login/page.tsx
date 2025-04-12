import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="bg-background dark:bg-background flex w-full flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
