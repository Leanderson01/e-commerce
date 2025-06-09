"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { env } from "~/env";
import { api } from "~/trpc/react";
import type { Session, User } from "@supabase/supabase-js";

interface SessionInfo {
  isValid: boolean;
  user: User | null;
  session: Session | null;
  tokenExpiry: string | null;
  cookieExists: boolean;
}

export function SessionDebug() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  // Test tRPC protected route
  const { data: userData, error: userError } =
    api.auth.user.getUserLogged.useQuery(undefined, {
      retry: false,
      refetchOnWindowFocus: false,
    });

  useEffect(() => {
    async function checkSession() {
      try {
        // Check if cookie exists
        const cookieExists = document.cookie.includes(
          "sb-localhost-auth-token",
        );

        // Create Supabase client
        const supabase = createBrowserClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        );

        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        let tokenExpiry = null;
        if (session?.access_token) {
          try {
            const payload = JSON.parse(
              atob(session.access_token.split(".")[1] ?? ""),
            ) as { exp: number };
            tokenExpiry = new Date(payload.exp * 1000).toLocaleString();
          } catch (e) {
            console.error("Error decoding JWT:", e);
          }
        }

        setSessionInfo({
          isValid: !!session && !error,
          user: session?.user ?? null,
          session: session ?? null,
          tokenExpiry,
          cookieExists,
        });
      } catch (error) {
        console.error("Error checking session:", error);
        setSessionInfo({
          isValid: false,
          user: null,
          session: null,
          tokenExpiry: null,
          cookieExists: false,
        });
      }
    }

    void checkSession();
  }, []);

  if (!sessionInfo) {
    return <div className="rounded border p-4">Loading session info...</div>;
  }

  return (
    <div className="bg-muted/50 space-y-4 rounded border p-4">
      <h3 className="text-lg font-bold">🔐 Session Debug Info</h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Cookie Exists:</strong>
          <span
            className={`ml-2 rounded px-2 py-1 ${
              sessionInfo.cookieExists
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {sessionInfo.cookieExists ? "✅ Yes" : "❌ No"}
          </span>
        </div>

        <div>
          <strong>Session Valid:</strong>
          <span
            className={`ml-2 rounded px-2 py-1 ${
              sessionInfo.isValid
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {sessionInfo.isValid ? "✅ Valid" : "❌ Invalid"}
          </span>
        </div>

        <div>
          <strong>Token Expiry:</strong>
          <span className="text-muted-foreground ml-2">
            {sessionInfo.tokenExpiry ?? "N/A"}
          </span>
        </div>

        <div>
          <strong>User ID:</strong>
          <span className="text-muted-foreground ml-2">
            {sessionInfo.user?.id ?? "N/A"}
          </span>
        </div>
      </div>

      <div>
        <strong>tRPC User Query:</strong>
        {userData ? (
          <div className="ml-2 text-green-600">
            ✅ Success: {userData.email}
          </div>
        ) : userError ? (
          <div className="ml-2 text-red-600">❌ Error: {userError.message}</div>
        ) : (
          <div className="ml-2 text-yellow-600">⏳ Loading...</div>
        )}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer font-medium">
          📋 Raw Session Data
        </summary>
        <pre className="bg-background mt-2 max-h-40 overflow-auto rounded border p-2 text-xs">
          {JSON.stringify(
            {
              session: sessionInfo.session,
              userData,
              userError: userError?.message,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}
