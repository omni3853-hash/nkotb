"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ReactNode } from "react";

interface DynamicHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    text: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function DynamicHeader({
  title,
  subtitle,
  actionButton,
  className = "",
}: DynamicHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 mx-6 rounded-xl py-8 mt-4 text-zinc-100 bg-emerald-900 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear ${className}`}
    >
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <h1 className="text-base font-medium">{title}</h1>
        </div>
        {actionButton && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-emerald-900 p-5 rounded-full text-white"
              size="sm"
              onClick={actionButton.onClick}
            >
              {actionButton.icon || <PlusIcon className="size-4" />}
              <span className="">{actionButton.text}</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
