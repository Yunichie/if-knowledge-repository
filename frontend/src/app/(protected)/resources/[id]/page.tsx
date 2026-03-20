import { getResource } from "@/features/resources/api";
import { ResourceDetail } from "@/features/resources/components/ResourceDetail";

interface ResourcePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ResourcePageProps) {
  const { id } = await params;
  const resource = await getResource(id);
  return {
    title: `${resource.title} — Dept. Knowledge Repo`,
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { id } = await params;
  const resource = await getResource(id);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <ResourceDetail resource={resource} />
      </div>
    </main>
  );
}
