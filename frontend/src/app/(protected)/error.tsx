"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function isNetworkError(error: Error): boolean {
  return error.message.startsWith("Unable to reach the server");
}

export default function ProtectedError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const title = isNetworkError(error)
    ? "Can't reach the server"
    : "Something went wrong";

  const description = isNetworkError(error)
    ? "The server is unreachable. Check your connection and try again."
    : "An unexpected error occurred while loading this page.";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              {description}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground/60 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={reset}>
              Try again
            </Button>
            <Link
              href="/resources"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Browse resources
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
