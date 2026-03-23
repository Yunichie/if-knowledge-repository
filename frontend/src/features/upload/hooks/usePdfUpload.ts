"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { presign } from "@/features/upload/api";

export interface PdfUploadResult {
  file_url: string;
  key: string;
}

/** Hook for uploading a PDF file via presigned URL. */
export function usePdfUpload() {
  const { data: session } = useSession();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const upload = (file: File): Promise<PdfUploadResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        const token = session?.accessToken ?? "";

        const { upload_url, file_url, key } = await presign(token, {
          filename: file.name,
          content_type: "application/pdf",
          file_size: file.size,
        });

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          setUploadProgress(null);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ file_url, key });
          } else {
            reject(
              new Error(`File upload to storage failed (HTTP ${xhr.status})`),
            );
          }
        });

        xhr.addEventListener("error", () => {
          setUploadProgress(null);
          reject(new Error("File upload to storage failed"));
        });

        xhr.addEventListener("abort", () => {
          setUploadProgress(null);
          reject(new Error("File upload cancelled"));
        });

        setUploadProgress(0);
        xhr.open("PUT", upload_url);
        xhr.setRequestHeader("Content-Type", "application/pdf");
        xhr.send(file);
      } catch (err) {
        setUploadProgress(null);
        reject(err);
      }
    });
  };

  return { upload, uploadProgress };
}
