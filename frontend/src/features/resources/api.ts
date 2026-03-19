/**
 * Resources feature API calls.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import type { Resource, ResourceQuery, CreateResourceRequest } from "@/lib/types";

/** Server-side: list resources with optional search/filter/pagination. */
export async function getResources(params: ResourceQuery): Promise<Resource[]> {
  const session = await getServerSession(authOptions);
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.type) searchParams.set("type", params.type);
  if (params.category_id) searchParams.set("category_id", params.category_id);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.page) searchParams.set("page", params.page);
  if (params.page_size) searchParams.set("page_size", params.page_size);

  const query = searchParams.toString();
  const path = `/api/v1/resources${query ? `?${query}` : ""}`;

  return apiClient<Resource[]>(path, {
    token: session?.accessToken,
  });
}

/** Server-side: get a single resource by ID. */
export async function getResource(id: string): Promise<Resource> {
  const session = await getServerSession(authOptions);
  return apiClient<Resource>(`/api/v1/resources/${id}`, {
    token: session?.accessToken,
  });
}

/** Client-side: create a new resource. */
export async function createResource(
  token: string,
  body: CreateResourceRequest
): Promise<Resource> {
  return apiClient<Resource>("/api/v1/resources", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

/** Client-side: delete a resource. */
export async function deleteResource(
  token: string,
  id: string
): Promise<void> {
  return apiClient<void>(`/api/v1/resources/${id}`, {
    method: "DELETE",
    token,
  });
}