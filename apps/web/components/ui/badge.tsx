import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[--base-blue] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[--base-blue] text-white hover:bg-[--base-blue-hover]",
        secondary:
          "border-transparent bg-[--farcaster-purple] text-white hover:bg-[--farcaster-purple-hover]",
        outline: "border-[--gray-700] text-[--gray-300]",
        success:
          "border-transparent bg-[--success] text-white",
        warning:
          "border-transparent bg-[--warning] text-white",
        error:
          "border-transparent bg-[--error] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

