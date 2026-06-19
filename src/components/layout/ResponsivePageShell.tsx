import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsivePageProps {
  mobile: React.ReactNode;
  tablet: React.ReactNode;
  className?: string;
}

/**
 * Dual-view page wrapper.
 * Renders the `mobile` branch below the `md` breakpoint and the `tablet`
 * branch at `md` and above. This lets each page keep its exact phone-sized
 * layout while providing a separate, professional tablet layout.
 */
export function ResponsivePage({ mobile, tablet, className }: ResponsivePageProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="block md:hidden">{mobile}</div>
      <div className="hidden md:block">{tablet}</div>
    </div>
  );
}

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** Preserves the original phone-sized layout on mobile viewports. */
export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className={cn("max-w-md mx-auto w-full", className)}>
      {children}
    </div>
  );
}

interface TabletContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** Comfortable, centred tablet layout that uses the extra horizontal space. */
export function TabletContainer({ children, className }: TabletContainerProps) {
  return (
    <div className={cn("max-w-5xl mx-auto w-full px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

interface PageColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}

/** Common two-column tablet layout: primary content + secondary sidebar. */
export function PageColumnLayout({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
}: PageColumnLayoutProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6", className)}>
      <div className={cn("lg:col-span-8", leftClassName)}>{left}</div>
      <div className={cn("lg:col-span-4", rightClassName)}>{right}</div>
    </div>
  );
}
