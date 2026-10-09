"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ExpandableSearchProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export function ExpandableSearch({
  placeholder = "Search...",
  onSearch,
  className,
}: ExpandableSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleToggle = () => {
    if (isExpanded && searchValue) {
      setSearchValue("");
      onSearch?.("");
    } else if (isExpanded && !searchValue) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsExpanded(false);
      setSearchValue("");
      onSearch?.("");
    }
  };

  return (
    <div className={cn("relative flex items-center gap-0", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-l-lg border border-r-0 bg-background transition-all duration-300 ease-in-out",
          isExpanded ? "w-28 md:w-62 xl:w-72 border-input" : "w-0 border-transparent",
        )}
      >
        <Input
          ref={inputRef}
          type="search"
          aria-label={placeholder}
          tabIndex={isExpanded ? 0 : -1}
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-9 w-full border-0 bg-transparent px-3 focus-visible:ring-0 focus-visible:ring-offset-0",
            isExpanded ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggle}
        type="button"
        aria-expanded={isExpanded}
        className={cn(
          "h-[38px] w-9 shrink-0 transition-colors",
          isExpanded ? "rounded-l-none border" : "rounded-lg",
        )}
      >
        {isExpanded && searchValue ? (
          <X className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Search className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="sr-only">{isExpanded ? (searchValue ? "Clear search" : "Close search") : "Open search"}</span>
      </Button>
    </div>
  );
}