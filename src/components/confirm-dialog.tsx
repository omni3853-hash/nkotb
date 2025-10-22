"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;

    /** Confirm button */
    confirmText?: React.ReactNode;
    confirmVariant?: React.ComponentProps<typeof Button>["variant"];
    confirmClassName?: string;

    /** Cancel button */
    cancelText?: React.ReactNode;
    cancelVariant?: React.ComponentProps<typeof Button>["variant"];
    cancelClassName?: string;

    /** Loading state when confirming */
    confirming?: boolean;

    /** Called when "Confirm" clicked */
    onConfirm?: () => Promise<void> | void;

    /** Icon on title (optional) */
    icon?: React.ReactNode;

    /** Dangerous tone toggle */
    tone?: "danger" | "default";
};

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    confirmText = "Confirm",
    confirmVariant = "default",
    confirmClassName,
    cancelText = "Cancel",
    cancelVariant = "outline",
    cancelClassName,
    confirming = false,
    onConfirm,
    icon,
    tone = "default",
}: ConfirmDialogProps) {
    // If danger tone and consumer didn't explicitly choose a variant,
    // use destructive so the label has proper contrast.
    const computedConfirmVariant: React.ComponentProps<typeof Button>["variant"] =
        tone === "danger" && confirmVariant === "default"
            ? "destructive"
            : confirmVariant;

    // Ensure text remains visible even in loading state (some Button
    // impls reduce opacity). Also guard foreground color in danger mode.
    const computedConfirmClassName = cn(
        confirmClassName,
        tone === "danger" && "text-destructive-foreground",
        // when Button applies a loading state class, keep label readable
        "data-[state=loading]:text-current"
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90vw] max-w-md max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle
                        className={cn(
                            "flex items-center gap-2",
                            tone === "danger" && "text-red-600"
                        )}
                    >
                        {icon ?? (tone === "danger" ? <AlertTriangle className="size-5" /> : null)}
                        {title}
                    </DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>

                {children ? <div className="mt-2">{children}</div> : null}

                <DialogFooter className="gap-2">
                    <Button
                        variant={cancelVariant}
                        onClick={() => onOpenChange(false)}
                        disabled={confirming}
                        className={cancelClassName}
                    >
                        {cancelText}
                    </Button>

                    <Button
                        variant={computedConfirmVariant}
                        onClick={onConfirm}
                        isLoading={confirming}
                        loadingText={
                            typeof confirmText === "string" ? `${confirmText}…` : "Working…"
                        }
                        className={computedConfirmClassName}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
