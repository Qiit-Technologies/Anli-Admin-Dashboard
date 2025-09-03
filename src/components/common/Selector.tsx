"use client";
import { ChevronsUpDown } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useRef } from "react";

const Selector = ({
  open,
  setOpen,
  placeholder,
  value,
  disabled = false,
  className = "",
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  placeholder: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={`w-full border-none shadow-none items-center justify-start h-10 ${className}`}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-full p-0"
        style={{
          width: buttonRef.current ? buttonRef.current.offsetWidth : undefined,
          minWidth: buttonRef.current
            ? buttonRef.current.offsetWidth
            : undefined,
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};
export default Selector;
