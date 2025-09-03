import { cn } from "@/utils/utils";
import { Check } from "lucide-react";
import { ReactNode, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Selector from "./Selector";

interface SearchSelectProps<T> {
  items: T[];
  value: T | null | undefined;
  onChange: (item: T) => void;
  placeholder?: string;
  className?: string;
  displayValue?: (item: T) => string;
  searchPlaceholder?: string;
  label: string | ReactNode;
  id: string;
  disabled: boolean;
}

export const SearchSelect = <T,>({
  items,
  value,
  onChange,
  placeholder = "Select an item",
  className = "bg-white h-10",
  displayValue = (item) => String(item),
  searchPlaceholder = "Search...",
  id,
  label,
  disabled,
}: SearchSelectProps<T>) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col w-full flex-1">
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
      <div className="border rounded-lg w-full">
        <Selector
          open={open}
          setOpen={setOpen}
          placeholder={placeholder}
          value={value ? displayValue(value) : ""}
          className={className}
          disabled={disabled}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-10" />
            <CommandList>
              <CommandEmpty>No items found</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={displayValue(item)}
                    value={displayValue(item)}
                    onSelect={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    {displayValue(item)}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === item ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </Selector>
      </div>
    </div>
  );
};
