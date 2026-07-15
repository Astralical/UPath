"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-primary-100 text-primary-800": variant === "default",
          "bg-gray-100 text-gray-800": variant === "secondary",
          "bg-red-100 text-red-800": variant === "destructive",
          "border border-gray-200 text-gray-800": variant === "outline",
          "bg-green-100 text-green-800": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
