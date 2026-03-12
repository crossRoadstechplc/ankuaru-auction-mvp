"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  isLoading?: boolean;
  onSearch?: (value: string) => void;
  showSearchButton?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, isLoading, value, onSearch, showSearchButton, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = value && value.toString().length > 0;

    const handleSearchClick = () => {
      if (onSearch) onSearch(value?.toString() || "");
    };

    return (
      <div
        className={cn(
          "relative flex items-center w-full group transition-all duration-300",
          className
        )}
      >
        <div
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center transition-all duration-300",
            isFocused ? "text-primary scale-110" : "text-muted-foreground"
          )}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <span className="material-symbols-outlined text-xl">search</span>
          )}
        </div>

        <Input
          {...props}
          ref={ref}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "pl-10 rounded-full border-none transition-all duration-500",
            isFocused
              ? "bg-card shadow-lg shadow-primary/5 ring-4 ring-primary/5"
              : "bg-secondary/40 hover:bg-secondary/60 shadow-none",
            "h-11",
            hasValue || showSearchButton ? "pr-20" : "pr-10",
            className
          )}
        />

        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasValue && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[18px] leading-none">
                close
              </span>
            </button>
          )}
          
          {(showSearchButton || (hasValue && onSearch)) && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleSearchClick}
              className="h-8 w-8 p-0 rounded-full text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
