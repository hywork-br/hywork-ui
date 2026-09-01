import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "../lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title className={cn("hw-dialog__title", className)} ref={ref} {...props} />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    className={cn("hw-dialog__description", className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  tone?: "default" | "alert";
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ children, className, tone = "default", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="hw-dialog__overlay" />
    <DialogPrimitive.Content
      className={cn("hw-dialog__content", className)}
      data-tone={tone}
      ref={ref}
      {...(tone === "alert" ? { role: "alertdialog" } : {})}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn("hw-dialog__actions", className)} ref={ref} {...props} />
));
DialogActions.displayName = "DialogActions";

export const AlertDialog = Dialog;
export const AlertDialogTrigger = DialogTrigger;
export const AlertDialogClose = DialogClose;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;

export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  Omit<DialogContentProps, "tone">
>((props, ref) => <DialogContent ref={ref} tone="alert" {...props} />);
AlertDialogContent.displayName = "AlertDialogContent";
