import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[loading=true]:cursor-progress data-[loading=true]:opacity-90",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Show loading state */
    isLoading?: boolean;
    /** Optional loading label next to the spinner */
    loadingText?: React.ReactNode;
    /** Custom spinner node (defaults to built-in) */
    spinner?: React.ReactNode;
    /** Disable button while loading (default: true) */
    disableWhileLoading?: boolean;
    /** Preserve original width while loading by overlaying spinner (default: true) */
    preserveWidth?: boolean;
  };

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn("animate-spin", className)}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
    />
  </svg>
);

const spinnerSizeByButtonSize: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "size-4",
  sm: "size-3.5",
  lg: "size-5",
  icon: "size-5",
  "icon-sm": "size-4",
  "icon-lg": "size-6",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      spinner,
      disableWhileLoading = true,
      preserveWidth = true,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const resolvedDisabled = disabled || (disableWhileLoading && isLoading);

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-loading={isLoading ? "true" : undefined}
        aria-busy={isLoading || undefined}
        aria-live={isLoading ? "polite" : undefined}
        disabled={resolvedDisabled}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {/* Normal content; optionally hidden to preserve width while spinner overlays */}
        <span
          className={cn(
            "inline-flex items-center",
            size === "sm" ? "gap-1.5" : "gap-2",
            isLoading && preserveWidth && "invisible"
          )}
        >
          {children}
        </span>

        {/* Loading overlay */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            {spinner ?? (
              <Spinner className={spinnerSizeByButtonSize[size ?? "default"]} />
            )}
            {loadingText ? <span className="ml-2">{loadingText}</span> : null}
          </span>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
