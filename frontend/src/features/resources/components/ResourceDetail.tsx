"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PdfViewer } from "@/features/resources/components/PdfViewer";
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

/**
 * Extract a YouTube embed URL from any common URL shape:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://www.youtube.com/watch?v=VIDEO_ID&t=120&list=PL...
 *   https://youtu.be/VIDEO_ID
 *   https://youtu.be/VIDEO_ID?t=120
 *   https://www.youtube.com/embed/VIDEO_ID
 */
function getYouTubeEmbedUrl(rawUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  let videoId: string | null = null;

  if (parsed.hostname === "youtu.be") {
    videoId = parsed.pathname.slice(1) || null;
  } else if (
    parsed.hostname === "www.youtube.com" ||
    parsed.hostname === "youtube.com" ||
    parsed.hostname === "m.youtube.com"
  ) {
    if (parsed.pathname.startsWith("/embed/")) return rawUrl;
    videoId = parsed.searchParams.get("v");
  }

  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

interface ResourceDetailProps {
  resource: Resource;
}

export function ResourceDetail({ resource }: ResourceDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { deleteResource, isLoading: isDeleting } = useDeleteResource();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const badgeStyle =
    TYPE_BADGE_STYLES[resource.type] ?? "bg-muted text-muted-foreground";
  const isAuthor = !!session?.userId && session.userId === resource.author_id;
  const embedUrl =
    resource.type === "youtube" && resource.youtube_url
      ? getYouTubeEmbedUrl(resource.youtube_url)
      : null;

  const handleDelete = async () => {
    setConfirmOpen(false);
    try {
      await deleteResource(resource.id);
      router.push("/resources");
      router.refresh();
    } catch {
      toast.error("Failed to delete resource. Please try again.");
    }
  };

  return (
    <article className="space-y-6">
      {/* Header */}
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

      {/* Content */}
      {resource.type === "pdf" && resource.file_url && (
        <PdfViewer url={resource.file_url} title={resource.title} />
      )}

      {resource.type === "youtube" &&
        (embedUrl ? (
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-lg"
              allowFullScreen
              title={resource.title}
            />
          </div>
        ) : (
          <p className="text-sm text-destructive">
            Could not parse YouTube URL.{" "}
            {resource.youtube_url && (
              <a
                href={resource.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Open on YouTube
              </a>
            )}
          </p>
        ))}

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
              onClick={() => setConfirmOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete Resource"}
            </Button>
          </div>
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete resource?</DialogTitle>
            <DialogDescription>
              <strong className="text-foreground">{resource.title}</strong> will
              be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
