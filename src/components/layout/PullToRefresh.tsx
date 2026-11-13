import React, { useState, useRef, useCallback } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const PULL_THRESHOLD = 64; // Distance in px to trigger refresh
const MAX_PULL = 100; // Maximum pull distance in px

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isPulling = useRef(false);
  const pullDistance = useRef(0);

  const defaultRefresh = useCallback(async () => {
    // Invalidate and refetch active React Query caches
    await Promise.all([
      queryClient.refetchQueries({ type: "active" }),
      new Promise((resolve) => setTimeout(resolve, 600)),
    ]);
  }, [queryClient]);

  const updateIndicatorDom = useCallback((distance: number, pulling: boolean, refreshing: boolean) => {
    const el = indicatorRef.current;
    if (!el) return;
    const progress = Math.min(1, distance / PULL_THRESHOLD);
    const show = distance > 8 || refreshing;

    el.style.transition = pulling ? "none" : "all 250ms ease-out";
    el.style.top = `calc(var(--safe-top, env(safe-area-inset-top, 0px)) + 12px + ${distance * 0.75}px)`;
    el.style.opacity = show ? "1" : "0";
    el.style.transform = `translate(-50%, ${show ? "0px" : "-24px"}) scale(${0.7 + progress * 0.3})`;

    if (arrowRef.current && !refreshing) {
      arrowRef.current.style.transform = `rotate(${progress >= 1 ? 180 : progress * 180}deg)`;
    }
    if (textRef.current && !refreshing) {
      textRef.current.textContent = progress >= 1 ? "Release to refresh" : "Pull down to refresh";
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;

    // Only initiate pull-to-refresh when user is at the very top of the page
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      containerRef.current?.scrollTop ||
      0;

    if (scrollTop <= 1) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || startY.current === null || isRefreshing) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(currentX - (startX.current ?? currentX));
    const diffY = currentY - startY.current;

    // If gesture is more horizontal than vertical, abort pull gesture
    if (diffX > 20 && diffX > diffY) {
      isPulling.current = false;
      pullDistance.current = 0;
      updateIndicatorDom(0, false, false);
      return;
    }

    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      containerRef.current?.scrollTop ||
      0;

    // If scrolled down, abort pull gesture
    if (scrollTop > 1) {
      isPulling.current = false;
      pullDistance.current = 0;
      updateIndicatorDom(0, false, false);
      return;
    }

    if (diffY > 0) {
      // Apply progressive damping resistance curve without re-rendering children
      const damped = Math.min(MAX_PULL, Math.pow(diffY, 0.82));
      pullDistance.current = damped;
      updateIndicatorDom(damped, true, false);
    } else {
      pullDistance.current = 0;
      updateIndicatorDom(0, true, false);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current && !isRefreshing) return;
    isPulling.current = false;
    startX.current = null;
    startY.current = null;

    if (pullDistance.current >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      pullDistance.current = 48; // Keep indicator visible while refreshing
      updateIndicatorDom(48, false, true);

      try {
        if (onRefresh) {
          await Promise.all([
            onRefresh(),
            new Promise((resolve) => setTimeout(resolve, 500)),
          ]);
        } else {
          await defaultRefresh();
        }
      } catch (err) {
        console.error("[PullToRefresh] Refresh failed", err);
      } finally {
        setIsRefreshing(false);
        pullDistance.current = 0;
        updateIndicatorDom(0, false, false);
      }
    } else {
      pullDistance.current = 0;
      updateIndicatorDom(0, false, false);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={cn("relative", className)}
    >
      {/* Pull Indicator Pill */}
      <div
        ref={indicatorRef}
        className="absolute left-1/2 -translate-x-1/2 z-[9999] pointer-events-none opacity-0"
        style={{
          top: "calc(var(--safe-top, env(safe-area-inset-top, 0px)) + 12px)",
          transform: "translate(-50%, -24px) scale(0.7)",
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border shadow-md text-xs font-medium text-foreground">
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Refreshing…</span>
            </>
          ) : (
            <>
              <ArrowDown
                ref={arrowRef}
                className="w-4 h-4 text-primary transition-transform duration-200"
              />
              <span ref={textRef}>Pull down to refresh</span>
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
