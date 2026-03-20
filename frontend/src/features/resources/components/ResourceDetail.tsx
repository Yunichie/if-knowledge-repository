"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useDeleteResource } from "@/features/resources/hooks/useDeleteResource";
import type { Resource } from "@/lib/types";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  pdf: "bg-red-50 text-red-700",
  youtube: "bg-orange-50 text-orange-700",
  article: "bg-blue-50 text-blue-700",
};

interface ResourceDetailProps {
  resource: Resource;
}

export function ResourceDetail({ resource }: ResourceDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { deleteResource, isLoading: isDeleting } = useDeleteResource();

  const badgeStyle =
    TYPE_BADGE_STYLES[resource.type] ?? "bg-muted text-muted-foreground";

  const isAuthor = !!session?.userId && session.userId === resource.author_id;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    await deleteResource(resource.id);
    router.push("/resources");
    router.refresh();
  };

  return (
    <article className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badgeStyle}`}
          >
            {resource.type.toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground">
            {resource.category_name}
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-foreground">
          {resource.title}
        </h1>

        <p className="text-xs text-muted-foreground">
          {resource.author_name} · {formatDate(resource.created_at)}
          {resource.file_size ? ` · ${formatFileSize(resource.file_size)}` : ""}
        </p>

        {resource.description && (
          <p className="text-sm text-foreground leading-relaxed">
            {resource.description}
          </p>
        )}

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Content area */}
      {resource.type === "pdf" && resource.file_url && (
        <div className="space-y-3">
          <a
            href={resource.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants())}
          >
            Download PDF
          </a>
          <iframe
            src={resource.file_url}
            className="w-full h-150 rounded-lg border border-border"
            title={resource.title}
          />
        </div>
      )}

      {resource.type === "youtube" && resource.youtube_url && (
        <div className="aspect-video">
          <iframe
            src={resource.youtube_url.replace("watch?v=", "embed/")}
            className="w-full h-full rounded-lg"
            allowFullScreen
            title={resource.title}
          />
        </div>
      )}

      {resource.type === "article" && resource.content && (
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {resource.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Author-only actions */}
      {isAuthor && (
        <>
          <Separator />
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete Resource"}
            </Button>
          </div>
        </>
      )}
    </article>
  );
}
