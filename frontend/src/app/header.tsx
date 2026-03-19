"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/resources" className="text-base font-semibold text-foreground">
          Dept. Knowledge Repo
        </Link>

        <nav className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/resources/new"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                + New Resource
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
