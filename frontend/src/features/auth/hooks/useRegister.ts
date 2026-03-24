"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { register as registerApi } from "@/features/auth/api";
import { ApiError } from "@/lib/api-client";

/** Hook for registering a new student. */
export function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (
    email: string,
    fullName: string,
    password: string,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerApi({
        email,
        full_name: fullName,
        password,
      });

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(
          "Account created, but sign-in failed. Please sign in manually.",
        );
        return null;
      }

      router.push("/resources");
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
