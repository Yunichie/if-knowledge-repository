"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  // Nothing to render if there's only one page (or none).
  if (totalPages <= 1) return null;

  const buildHref = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target === 1) {
      params.delete("page");
    } else {
      params.set("page", String(target));
    }
    const qs = params.toString();
    return `/resources${qs ? `?${qs}` : ""}`;
  };

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between pt-2">
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          ← Previous
        </Link>
      ) : (
        <span />
      )}

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Next →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
