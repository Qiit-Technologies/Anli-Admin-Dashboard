"use client";
import { cn } from "@/utils/utils";
import { Check, ChevronDown, X } from "lucide-react";
import React, { ReactNode, useEffect, useRef, useState } from "react";

interface MultiSelectProps<T> {
  items: T[];
  value: T[];
  onChange: (items: T[]) => void;
  placeholder?: string;
  className?: string;
  displayValue?: (item: T) => string;
  searchPlaceholder?: string;
  label: string | ReactNode;
  id: string;
  disabled?: boolean;
  maxSelectedDisplay?: number;
}

export const NewMultiSelect = <T,>({
  items,
  value,
  onChange,
  placeholder = "Select items",
  className = "bg-white h-10",
  displayValue = (item) => String(item),
  searchPlaceholder = "Search...",
  id,
  label,
  disabled = false,
  maxSelectedDisplay = 3,
}: MultiSelectProps<T>) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom",
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter((item) =>
    displayValue(item).toLowerCase().includes(search.toLowerCase()),
  );

  const calculatePosition = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(280, filteredItems.length * 40 + 100);

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownPosition("top");
    } else {
      setDropdownPosition("bottom");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      calculatePosition();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [open, filteredItems.length]);

  useEffect(() => {
    const handleResize = () => {
      if (open) {
        calculatePosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  const handleSelect = (item: T) => {
    const isSelected = value.some((v) => v === item);
    if (isSelected) {
      onChange(value.filter((v) => v !== item));
    } else {
      onChange([...value, item]);
    }
  };

  const handleRemove = (item: T, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== item));
  };

  const handleToggle = () => {
    if (!disabled) {
      setOpen(!open);
      setSearch("");
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([...filteredItems]);
  };

  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => value.some((v) => v === item));

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;

    if (value.length <= maxSelectedDisplay) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-orion-blue/10 border border-orion-blue text-orion-blue text-xs rounded-md font-medium"
            >
              {displayValue(item)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-orion-blue/80"
                onClick={(e) => handleRemove(item, e)}
              />
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-orion-blue">
          {value.length} item{value.length !== 1 ? "s" : ""} selected
        </span>
        {/* Removed nested button - this was causing the hydration error */}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full flex-1" ref={containerRef}>
      {typeof label === "string" ? (
        <label
          htmlFor={id}
          className="text-sm font-medium text-muted-foreground mb-1"
        >
          {label}
        </label>
      ) : (
        <div className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </div>
      )}
      <div className="border rounded-lg w-full relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            "w-full border-none shadow-none items-center justify-start min-h-10 px-3 py-2 text-left bg-transparent hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 flex",
            className,
          )}
        >
          <div className="flex-1 min-w-0">{getDisplayText()}</div>
          <ChevronDown
            className={cn(
              "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div
            ref={dropdownRef}
            className={cn(
              "absolute left-0 right-0 z-50 bg-white border rounded-md shadow-lg",
              dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1",
            )}
            style={{
              maxHeight: "280px",
              minWidth: "100%",
            }}
          >
            <div className="p-2 border-b">
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-orion-blue"
              />
            </div>

            <div className="px-3 py-2 bg-gray-50 border-b text-xs text-gray-600 flex justify-between items-center">
              <span className="font-medium text-orion-blue">
                {value.length} of {items.length} selected
                {search && ` (${filteredItems.length} filtered)`}
              </span>
              <div className="flex gap-2">
                {filteredItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={isAllSelected}
                    className={cn(
                      "text-orion-blue hover:text-orion-blue/80 disabled:text-gray-400 disabled:cursor-not-allowed font-medium",
                      isAllSelected && "text-gray-400",
                    )}
                  >
                    {isAllSelected ? "All selected" : "Select all"}
                  </button>
                )}
                {value.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-orion-blue hover:text-orion-blue/80 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-48 overflow-auto">
              {filteredItems.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No items found
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = value.some((v) => v === item);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between transition-colors",
                        isSelected &&
                          "bg-orion-blue/10 text-orion-blue border-l-2 border-orion-blue font-medium",
                      )}
                    >
                      <span>{displayValue(item)}</span>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          isSelected
                            ? "opacity-100 text-orion-blue"
                            : "opacity-0",
                        )}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
