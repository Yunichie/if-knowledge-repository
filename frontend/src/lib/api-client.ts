/**
 * Base API client: all API calls go through this module.
 * Never call fetch() directly in components or hooks.
 */

/**
 * Next.js extends the global `fetch` with a `next` property that controls the
 * Data Cache.  Adding it here lets callers opt in to
 * caching on a per-request basis without bypassing this module.
 */
interface NextFetchOptions {
  /** Seconds before the cached entry is considered stale (ISR-style).
   *  Pass `false` to opt out of caching entirely (same as `no-store`). */
  revalidate?: number | false;
  /** Cache tags for on-demand revalidation via `revalidateTag()`. */
  tags?: string[];
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { token?: string; next?: NextFetchOptions },
): Promise<T> {
  const { token, next, ...fetchOptions } = options ?? {};

  let res: Response;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...fetchOptions,
      ...(next !== undefined ? { next } : {}),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
      },
    } as RequestInit);
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the server. Please check your connection and try again.",
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(res.status, body.error ?? "Request failed");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
