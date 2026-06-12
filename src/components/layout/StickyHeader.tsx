import * as React from "react";
import { cn } from "@/lib/utils";

type StickyHeaderProps = React.PropsWithChildren<{
  className?: string;
  as?: "header" | "div";
}>;

export function StickyHeader({ children, className, as: Tag = "div" }: StickyHeaderProps) {
  return (
    <Tag
      className={cn(
        "sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
