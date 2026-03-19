"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

/** Hook for logging in with email + password via NextAuth. */
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return false;
      }

      return true;
    } catch {
      setError("Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}
