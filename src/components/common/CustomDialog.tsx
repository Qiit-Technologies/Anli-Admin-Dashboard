import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export function CustomDialog({
  trigger,
  children,
  title,
  subTitle,
  open,
  onOpenChange,
  onSubmit,
  onConfirm,
  loading = false,
  isLoading = false,
  description,
  confirmText = "Submit",
  confirmDisabled = false,
}: {
  title: string;
  open?: boolean;
  subTitle?: string;
  description?: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  onSubmit?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
  isLoading?: boolean;
  confirmText?: string;
  confirmDisabled?: boolean;
}) {
  const submit = onSubmit ?? onConfirm;
  const isBusy = loading || isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description ?? subTitle}</DialogDescription>
        </DialogHeader>
        <div className="w-full my-2">{children}</div>
        {submit && (
          <DialogFooter>
            <Button
              disabled={isBusy || confirmDisabled}
              onClick={submit}
            >
              {isBusy ? "Loading..." : confirmText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
