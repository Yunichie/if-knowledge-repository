/**
 * Upload feature API calls.
 */
import { apiClient } from "@/lib/api-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { PresignRequest, PresignResponse } from "@/lib/types";

/** Client-side: get a presigned upload URL. */
export async function presign(
  token: string,
  body: PresignRequest,
): Promise<PresignResponse> {
  return apiClient<PresignResponse>("/api/v1/uploads/presign", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

/** Server-side: list all categories. */
export async function getCategories() {
  const session = await getServerSession(authOptions);
  return apiClient<{ id: string; name: string; slug: string }[]>(
    "/api/v1/categories",
    {
      token: session?.accessToken,
      next: { revalidate: 3600 },
    },
  );
}
