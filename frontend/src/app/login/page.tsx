import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Sign In — Dept. Knowledge Repo",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/resources");

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <LoginForm />
      </div>
    </main>
  );
}
