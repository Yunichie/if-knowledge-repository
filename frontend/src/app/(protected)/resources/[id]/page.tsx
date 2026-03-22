import { notFound } from "next/navigation";
import { getResource } from "@/features/resources/api";
import { ResourceDetail } from "@/features/resources/components/ResourceDetail";
import { ApiError } from "@/lib/api-client";

interface ResourcePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ResourcePageProps) {
  const { id } = await params;
  try {
    const resource = await getResource(id);
    return { title: `${resource.title} — Dept. Knowledge Repo` };
  } catch {
    return { title: "Resource — Dept. Knowledge Repo" };
  }
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { id } = await params;

  let resource;
  try {
    resource = await getResource(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <ResourceDetail resource={resource} />
      </div>
    </main>
  );
}
