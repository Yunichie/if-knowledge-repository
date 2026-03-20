import { getCategories } from "@/features/upload/api";
import { UploadForm } from "@/features/upload/components/UploadForm";

export const metadata = {
  title: "New Resource — Dept. Knowledge Repo",
};

export default async function NewResourcePage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">New Resource</h1>
        <UploadForm categories={categories} />
      </div>
    </main>
  );
}
