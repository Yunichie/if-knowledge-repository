import { Suspense } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { getResources } from "@/features/resources/api";
import { getCategories } from "@/features/upload/api";
import {
  ResourceList,
  ResourceListSkeleton,
} from "@/features/resources/components/ResourceList";
import { FilterBar } from "@/features/resources/components/FilterBar";
import { Pagination } from "@/features/resources/components/Pagination";
import type { ResourceQuery } from "@/lib/types";

export const metadata = {
  title: "Browse Resources — Dept. Knowledge Repo",
};

interface ResourcesPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const params = await searchParams;

  const query: ResourceQuery = {
    q: params.q,
    type: params.type as ResourceQuery["type"],
    category_id: params.category_id,
    tag: params.tag,
    page: params.page,
    page_size: params.page_size,
  };

  const [paginated, categories] = await Promise.all([
    getResources(query),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Browse Resources
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {paginated.total}{" "}
              {paginated.total === 1 ? "resource" : "resources"}
            </p>
          </div>
          <Link
            href="/resources/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            + New Resource
          </Link>
        </div>

        <Suspense fallback={null}>
          <FilterBar categories={categories} />
        </Suspense>

        <Suspense fallback={<ResourceListSkeleton />}>
          <ResourceList resources={paginated.data} />
        </Suspense>

        <Suspense fallback={null}>
          <Pagination
            page={paginated.page}
            totalPages={paginated.total_pages}
          />
        </Suspense>
      </div>
    </main>
  );
}
