"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { register as registerApi } from "@/features/auth/api";
import { ApiError } from "@/lib/api-client";

/** Hook for registering a new student. */
export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (email: string, fullName: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerApi({ email, full_name: fullName, password });

      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/resources",
      });

      return result;
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Registration failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}
