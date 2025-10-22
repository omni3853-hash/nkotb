"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export type AppToasterProps = ToasterProps;

export function Toaster(props: AppToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      // container behavior
      theme={theme as ToasterProps["theme"]}
      position={props.position ?? "top-right"}
      expand={props.expand ?? true}
      closeButton={props.closeButton ?? true}
      duration={props.duration ?? 4000}
      visibleToasts={props.visibleToasts ?? 5}
      offset={props.offset ?? 24}
      gap={props.gap ?? 14}
      // explicit icons
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      // polished UI: larger card, accent bar, solid backgrounds, improved type
      toastOptions={{
        classNames: {
          toast: [
            "group pointer-events-auto will-change-transform z-[9999]",
            // size & layout
            "w-[min(92vw,460px)] sm:w-[460px] px-5 py-4",
            "rounded-2xl border shadow-2xl",
            "backdrop-blur-[2px]",
            // base background/foreground
            "bg-white text-gray-900 border-gray-200",
            "dark:bg-neutral-900 dark:text-neutral-50 dark:border-neutral-800",
            // subtle ring on hover/focus for clarity
            "outline-none ring-0 transition-all duration-200",
            "hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
            "focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
            // LEFT ACCENT BAR per type
            "relative",
            "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:rounded-l-2xl",
            // success (green)
            "data-[type=success]:bg-green-50 data-[type=success]:text-green-950 data-[type=success]:border-green-200",
            "dark:data-[type=success]:bg-green-950/40 dark:data-[type=success]:text-green-100 dark:data-[type=success]:border-green-900",
            "data-[type=success]:before:bg-green-500 dark:data-[type=success]:before:bg-green-400",
            // error (red)
            "data-[type=error]:bg-red-50 data-[type=error]:text-red-950 data-[type=error]:border-red-200",
            "dark:data-[type=error]:bg-red-950/40 dark:data-[type=error]:text-red-100 dark:data-[type=error]:border-red-900",
            "data-[type=error]:before:bg-red-500 dark:data-[type=error]:before:bg-red-400",
            // info (sky)
            "data-[type=info]:bg-sky-50 data-[type=info]:text-sky-950 data-[type=info]:border-sky-200",
            "dark:data-[type=info]:bg-sky-950/40 dark:data-[type=info]:text-sky-100 dark:data-[type=info]:border-sky-900",
            "data-[type=info]:before:bg-sky-500 dark:data-[type=info]:before:bg-sky-400",
            // warning (amber)
            "data-[type=warning]:bg-amber-50 data-[type=warning]:text-amber-950 data-[type=warning]:border-amber-200",
            "dark:data-[type=warning]:bg-amber-950/40 dark:data-[type=warning]:text-amber-100 dark:data-[type=warning]:border-amber-900",
            "data-[type=warning]:before:bg-amber-500 dark:data-[type=warning]:before:bg-amber-400",
            // loading neutral
            "data-[type=loading]:bg-gray-50 data-[type=loading]:text-gray-900 data-[type=loading]:border-gray-200",
            "dark:data-[type=loading]:bg-neutral-900/60 dark:data-[type=loading]:text-neutral-100 dark:data-[type=loading]:border-neutral-800",
            "data-[type=loading]:before:bg-gray-400 dark:data-[type=loading]:before:bg-neutral-500",
          ].join(" "),
          // bigger, clearer text
          title: "text-base/6 font-semibold tracking-[0.01em] mb-0.5",
          description: "text-sm/6 text-gray-700 dark:text-neutral-300",
          // larger/tinted icons per type
          icon: [
            "me-3",
            "text-gray-700 dark:text-neutral-300",
            "group-data-[type=success]:text-green-700 dark:group-data-[type=success]:text-green-300",
            "group-data-[type=error]:text-red-700 dark:group-data-[type=error]:text-red-300",
            "group-data-[type=info]:text-sky-700 dark:group-data-[type=info]:text-sky-300",
            "group-data-[type=warning]:text-amber-700 dark:group-data-[type=warning]:text-amber-300",
          ].join(" "),
          // buttons
          actionButton:
            "rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide shadow-sm " +
            "bg-gray-900 text-white hover:opacity-90 active:opacity-80 " +
            "dark:bg-white dark:text-black",
          cancelButton:
            "rounded-lg px-3.5 py-2 text-xs font-medium tracking-wide " +
            "bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-50 active:bg-gray-100 " +
            "dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800/60",
          closeButton:
            "opacity-70 hover:opacity-100 text-gray-500 dark:text-neutral-400 transition-opacity",
        },
      }}
      {...props}
    />
  );
}

export default Toaster;
