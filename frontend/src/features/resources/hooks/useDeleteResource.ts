"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { deleteResource } from "@/features/resources/api";
import { ApiError } from "@/lib/api-client";

/** Hook for deleting a resource. */
export function useDeleteResource() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteResource(session?.accessToken ?? "", id);
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteResource: handleDelete, isLoading, error };
}
