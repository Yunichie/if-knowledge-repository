/**
 * Auth feature API calls.
 */
import { apiClient } from "@/lib/api-client";
import type { AuthResponse } from "@/lib/types";

interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

/** Register a new student via the Axum backend. */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
