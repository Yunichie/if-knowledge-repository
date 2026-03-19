"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePdfUpload } from "@/features/upload/hooks/usePdfUpload";
import { createResource } from "@/features/resources/api";
import { ApiError } from "@/lib/api-client";
import type { Category, ResourceType } from "@/lib/types";

interface UploadFormProps {
  categories: Category[];
}

export function UploadForm({ categories }: UploadFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { upload } = usePdfUpload();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resourceType, setResourceType] = useState<ResourceType>("article");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [tags, setTags] = useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [articleContent, setArticleContent] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }
    if (file && file.size > 52_428_800) {
      setError("File size exceeds 50 MB limit");
      return;
    }
    setError(null);
    setPdfFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = session?.accessToken ?? "";
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      let fileUrl: string | undefined;
      let fileSize: number | undefined;
      let r2Key: string | undefined;

      if (resourceType === "pdf" && pdfFile) {
        const result = await upload(pdfFile);
        fileUrl = result.file_url;
        r2Key = result.key;
        fileSize = pdfFile.size;
      }

      await createResource(token, {
        category_id: categoryId,
        type: resourceType,
        title,
        description: description || undefined,
        tags: tagList.length > 0 ? tagList : undefined,
        file_url: fileUrl,
        file_size: fileSize,
        r2_key: r2Key,
        youtube_url: resourceType === "youtube" ? youtubeUrl : undefined,
        content: resourceType === "article" ? articleContent : undefined,
      });

      router.push("/resources");
      router.refresh();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Failed to create resource";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resource Type Selector */}
      <div className="space-y-1.5">
        <Label>Resource Type</Label>
        <div className="flex gap-2">
          {(["article", "pdf", "youtube"] as ResourceType[]).map((t) => (
            <Button
              key={t}
              type="button"
              variant={resourceType === t ? "default" : "outline"}
              size="sm"
              onClick={() => setResourceType(t)}
            >
              {t === "pdf" ? "PDF" : t === "youtube" ? "YouTube" : "Article"}
            </Button>
          ))}
        </div>
      </div>

      {/* Common Fields */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Introduction to B-Trees"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the resource"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isLoading}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
        <Input
          id="tags"
          placeholder="e.g. algorithms, sorting, trees"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Type-specific fields */}
      {resourceType === "pdf" && (
        <div className="space-y-1.5">
          <Label htmlFor="pdf-file">PDF File</Label>
          <Input
            id="pdf-file"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">Maximum file size: 50 MB</p>
        </div>
      )}

      {resourceType === "youtube" && (
        <div className="space-y-1.5">
          <Label htmlFor="youtube-url">YouTube URL</Label>
          <Input
            id="youtube-url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      )}

      {resourceType === "article" && (
        <div className="space-y-1.5">
          <Label htmlFor="content">Article Content (Markdown)</Label>
          <Textarea
            id="content"
            placeholder="Write your article in Markdown…"
            value={articleContent}
            onChange={(e) => setArticleContent(e.target.value)}
            required
            disabled={isLoading}
            rows={12}
            className="font-mono text-sm"
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Publishing…" : "Publish Resource"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
