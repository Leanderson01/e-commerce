"use client";

import { api } from "~/trpc/react";

export default function ProfilePage() {
  const [user] = api.auth.user.getUserLogged.useSuspenseQuery();

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-muted-foreground text-sm">{user?.email}</p>
    </div>
  );
}
