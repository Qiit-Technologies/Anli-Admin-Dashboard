import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        //Base styles
        "flex h-10 w-full rounded-md bg-white border border-[#474747]",
        "px-4 py-2 text-[16px] font-medium text-[#0B0B0B] tracking-tight",
        //Focus/active states (modified to match your requirements)
        "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring",
        "active:border-transparent",
        //Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
