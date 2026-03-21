"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, ResourceType } from "@/lib/types";

const RESOURCE_TYPES: { label: string; value: ResourceType }[] = [
  { label: "PDF", value: "pdf" },
  { label: "YouTube", value: "youtube" },
  { label: "Article", value: "article" },
];

const DEBOUNCE_MS = 400;

interface FilterBarProps {
  categories: Category[];
}

export function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") ?? "";
  const currentCategory = searchParams.get("category_id") ?? "";
  const currentTag = searchParams.get("tag") ?? "";

  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  const pushSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/resources?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => pushSearch(value), DEBOUNCE_MS);
  };

  const handleSearchSubmit = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    pushSearch(searchValue);
  };

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
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search resources…"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit();
            }}
            className="pr-9"
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            aria-label="Search"
            className={cn(
              "absolute inset-y-0 right-0 flex items-center px-2.5",
              "text-muted-foreground hover:text-foreground transition-colors",
            )}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Type + Category filters */}
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
            onClick={() =>
              updateParams("type", currentType === value ? "" : value)
            }
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
              updateParams(
                "category_id",
                currentCategory === cat.id ? "" : cat.id,
              )
            }
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Active tag pill */}
      {currentTag && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Filtered by tag:
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {currentTag}
            <button
              type="button"
              onClick={() => updateParams("tag", "")}
              aria-label={`Remove tag filter: ${currentTag}`}
              className="ml-0.5 rounded-sm hover:bg-primary/20 transition-colors p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
