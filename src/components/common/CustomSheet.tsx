"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/utils/utils";
import { ArrowLeft } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "../ui/button";

interface CustomSheetProps {
  trigger?: ReactNode;
  children: ReactNode;
  title?: string;
  subTitle?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  defaultOpen?: boolean;
  noTitle?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
  loading?: boolean;
  confirmBtnTitle?: string;
}
export function CustomSheet({
  trigger,
  children,
  title,
  subTitle,
  open,
  setOpen,
  defaultOpen = false,
  noTitle = false,
  onClose,
  loading,
  onComplete,
  confirmBtnTitle = "Update",
}: Readonly<CustomSheetProps>) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    setOpen?.(newOpen);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side="right"
        className="overflow-y-auto h-full flex flex-col justify-between w-full sm:max-w-md md:max-w-lg"
      >
        <SheetHeader className="text-left pb-2">
          <button
            onClick={() => {
              handleOpenChange(false);
              onClose?.();
            }}
            className="flex items-center text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <SheetTitle
            className={cn(noTitle && "sr-only", "flex flex-col gap-1")}
          >
            <span>{title}</span>
            {subTitle && (
              <span className="text-sm text-muted-foreground">{subTitle}</span>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-y-auto">
          <div>{children}</div>
        </div>
        <div className="w-full flex gap-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-1/2 h-10 rounded-lg">
              Close
            </Button>
          </SheetClose>
          <Button
            onClick={onComplete}
            className={`w-1/2  h-10 rounded-lg ${
              loading
                ? "cursor-not-allowed bg-[#007bff60] hover:bg-[#007bff60]"
                : "bg-[#007bff] hover:bg-[#007bff]"
            }`}
          >
            {loading ? "...Loading" : confirmBtnTitle}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
