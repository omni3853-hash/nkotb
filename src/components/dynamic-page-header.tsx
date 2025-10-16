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
    <div className={`flex px-6 justify-between ${className}`}>
      <div className="">
        <h2 className="text-4xl font-bold tracking-tight text-emerald-9">
          {title}
        </h2>
        {subtitle && <p className="text-zinc-500">{subtitle}</p>}
      </div>
      {(actionButton || secondaryButton) && (
        <div className="flex items-center gap-x-2">
          {secondaryButton && (
            <Button
              variant="outline"
              className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 p-5 rounded-full"
              size="sm"
              onClick={secondaryButton.onClick}
            >
              {secondaryButton.icon}
              <span className="">{secondaryButton.text}</span>
            </Button>
          )}
          {actionButton && (
            <Button
              variant="outline"
              className="bg-emerald-900 p-5 rounded-full text-white"
              size="sm"
              onClick={actionButton.onClick}
            >
              {actionButton.icon || <PlusIcon className="size-4" />}
              <span className="">{actionButton.text}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
