"use client";

import { useSession } from "next-auth/react";
import { presign } from "@/features/upload/api";

/** Hook for uploading a PDF file via presigned URL. */
export function usePdfUpload() {
  const { data: session } = useSession();

  const upload = async (file: File): Promise<{ file_url: string; key: string }> => {
    const token = session?.accessToken ?? "";

    const { upload_url, file_url, key } = await presign(token, {
      filename: file.name,
      content_type: "application/pdf",
      file_size: file.size,
    });

    const r2Res = await fetch(upload_url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": "application/pdf" },
    });

    if (!r2Res.ok) throw new Error("File upload to storage failed");

    return { file_url, key };
  };

  return { upload };
}
