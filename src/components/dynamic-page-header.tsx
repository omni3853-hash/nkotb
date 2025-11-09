"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ReactNode } from "react";

interface DynamicPageHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  actionButton?: {
    text: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  secondaryButton?: {
    text: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function DynamicPageHeader({
  title,
  subtitle,
  actionButton,
  secondaryButton,
  className = "",
}: DynamicPageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row px-4 sm:px-6 justify-between gap-4 sm:gap-0 ${className}`}>
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-emerald-900 break-words">
          {title}
        </h2>
        {subtitle && <p className="text-sm sm:text-base text-zinc-500 mt-1">{subtitle}</p>}
      </div>

      {(actionButton || secondaryButton) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-x-2 shrink-0">
          {secondaryButton && (
            <Button
              variant="outline"
              className="inline-flex flex-row items-center justify-center gap-2 border-zinc-300 text-zinc-700 hover:bg-zinc-50 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base w-full sm:w-auto"
              size="sm"
              onClick={secondaryButton.onClick}
            >
              {secondaryButton.icon}
              <span className="whitespace-nowrap">{secondaryButton.text}</span>
            </Button>
          )}

          {actionButton && (
            <Button
              variant="outline"
              className="inline-flex flex-row items-center justify-center gap-2 bg-emerald-900 px-3 sm:px-4 py-2 rounded-full text-white text-sm sm:text-base w-full sm:w-auto"
              size="sm"
              onClick={actionButton.onClick}
            >
              {actionButton.icon || <PlusIcon className="w-4 h-4" aria-hidden="true" />}
              <span className="whitespace-nowrap">{actionButton.text}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
