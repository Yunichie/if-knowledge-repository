/**
 * Shared TypeScript types used across features.
 * Types scoped to a single feature belong in that feature's types.ts.
 */

export type ResourceType = "pdf" | "youtube" | "article";

export interface Resource {
  id: string;
  author_id: string;
  author_name: string;
  category_id: string;
  category_name: string;
  type: ResourceType;
  title: string;
  description: string | null;
  tags: string[];
  file_url: string | null;
  file_size: number | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  content: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CreateResourceRequest {
  category_id: string;
  type: ResourceType;
  title: string;
  description?: string;
  tags?: string[];
  file_url?: string;
  file_size?: number;
  r2_key?: string;
  youtube_url?: string;
  thumbnail_url?: string;
  content?: string;
}

export interface PresignRequest {
  filename: string;
  content_type: "application/pdf";
  file_size: number;
}

export interface PresignResponse {
  upload_url: string;
  file_url: string;
  key: string;
}

export interface ResourceQuery {
  q?: string;
  type?: ResourceType;
  category_id?: string;
  tag?: string;
  page?: string;
  page_size?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AuthResponse {
  token: string;
  student: StudentDto;
}

export interface StudentDto {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}
