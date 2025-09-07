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
  loading = false,
}: {
  title: string;
  open: boolean;
  subTitle: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subTitle}</DialogDescription>
        </DialogHeader>
        <div className="w-full mt-5">{children}</div>
        <DialogFooter>
          <Button
            className={`bg-orion-blue ${loading && "opacity-60 cursor-not-allowed"}`}
            onClick={onSubmit}
          >
            {loading ? "..loading" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
