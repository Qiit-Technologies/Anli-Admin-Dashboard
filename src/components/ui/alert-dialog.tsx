"use client";

import type { ButtonHTMLAttributes, ComponentProps } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";

function AlertDialog(props: ComponentProps<typeof Dialog>) {
  return <Dialog {...props} />;
}

function AlertDialogContent(props: ComponentProps<typeof DialogContent>) {
  return <DialogContent role="alertdialog" {...props} />;
}

function AlertDialogAction({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button className={className} {...props} />
  );
}

function AlertDialogCancel({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <DialogClose asChild>
      <Button variant="outline" className={className} {...props} />
    </DialogClose>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
};
