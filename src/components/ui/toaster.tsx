"use client";

import { CheckCircle, ThumbsUpIcon } from "lucide-react";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

import { Icons } from "./Icons";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="left">
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} className={variant == "destructive" ? "bg-red-500 text-white" : ""}>
            <div className="grid grid-flow-col gap-2">
              <div className="grid gap-1">
                {title && <ToastTitle className="flex flex-row-reverse gap-2 items-center text-base">{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              {variant == "default" && (
                <div className="relative h-full w-5">
                  <ThumbsUpIcon className="w-5 h-5 absolute top-1 left-0" />
                </div>
              )}
            </div>
            {action}
            <ToastClose className={variant == "destructive" ? "text-white hover:text-white" : ""} />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
