import Link from "next/link";
import type { Resource } from "@/lib/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Type badge color mapping */
const TYPE_BADGE_STYLES: Record<string, string> = {
  pdf: "bg-red-50 text-red-700",
  youtube: "bg-orange-50 text-orange-700",
  article: "bg-blue-50 text-blue-700",
};

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const badgeStyle =
    TYPE_BADGE_STYLES[resource.type] ?? "bg-muted text-muted-foreground";

  return (
    <div className="rounded-lg border border-border bg-card hover:border-primary/40 transition-colors duration-150 h-full flex flex-col">
      <Link
        href={`/resources/${resource.id}`}
        className="flex-1 block p-4 sm:p-5"
      >
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badgeStyle}`}
        >
          {resource.type.toUpperCase()}
        </span>

        <h3 className="mt-2 text-base font-semibold text-foreground line-clamp-2">
          {resource.title}
        </h3>

        {resource.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          {resource.author_name} · {formatDate(resource.created_at)}
        </p>
      </Link>

      {resource.tags.length > 0 && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/resources?tag=${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
