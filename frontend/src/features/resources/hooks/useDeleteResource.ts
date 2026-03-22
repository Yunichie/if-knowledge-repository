"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { deleteResource as deleteResourceApi } from "@/features/resources/api";

/** Hook for deleting a resource */
export function useDeleteResource() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const deleteResource = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      await deleteResourceApi(session?.accessToken ?? "", id);
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteResource, isLoading };
}
