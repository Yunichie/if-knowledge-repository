"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category, ResourceType } from "@/lib/types";

const RESOURCE_TYPES: { label: string; value: ResourceType }[] = [
  { label: "PDF", value: "pdf" },
  { label: "YouTube", value: "youtube" },
  { label: "Article", value: "article" },
];

interface FilterBarProps {
  categories: Category[];
}

export function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentType = searchParams.get("type") ?? "";
  const currentCategory = searchParams.get("category_id") ?? "";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/resources?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Search resources…"
          defaultValue={currentSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams("q", (e.target as HTMLInputElement).value);
            }
          }}
          className="flex-1"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentType === "" ? "default" : "outline"}
          size="sm"
          onClick={() => updateParams("type", "")}
        >
          All
        </Button>
        {RESOURCE_TYPES.map(({ label, value }) => (
          <Button
            key={value}
            variant={currentType === value ? "default" : "outline"}
            size="sm"
            onClick={() => updateParams("type", currentType === value ? "" : value)}
          >
            {label}
          </Button>
        ))}

        <span className="border-l border-border mx-1" />

        <Button
          variant={currentCategory === "" ? "default" : "outline"}
          size="sm"
          onClick={() => updateParams("category_id", "")}
        >
          All Categories
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={currentCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateParams("category_id", currentCategory === cat.id ? "" : cat.id)
            }
          >
            {cat.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
