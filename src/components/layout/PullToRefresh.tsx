import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isPulling = useRef(false);

  const defaultRefresh = useCallback(async () => {
    // Invalidate and refetch active React Query caches
    await Promise.all([
      queryClient.refetchQueries({ type: "active" }),
      new Promise((resolve) => setTimeout(resolve, 600)),
    ]);
  }, [queryClient]);

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
      setPullDistance(0);
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
      setPullDistance(0);
      return;
    }

    if (diffY > 0) {
      // Apply progressive damping resistance curve
      const damped = Math.min(MAX_PULL, Math.pow(diffY, 0.82));
      setPullDistance(damped);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current && !isRefreshing) return;
    isPulling.current = false;
    startX.current = null;
    startY.current = null;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(48); // Keep indicator visible while refreshing

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
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    if (!isRefreshing && pullDistance > 0 && !isPulling.current) {
      setPullDistance(0);
    }
  }, [isRefreshing, pullDistance]);

  const progress = Math.min(1, pullDistance / PULL_THRESHOLD);
  const showIndicator = pullDistance > 8 || isRefreshing;

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
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-transform duration-200 ease-out",
          !isPulling.current && "transition-all duration-300"
        )}
        style={{
          top: `calc(var(--safe-top, env(safe-area-inset-top, 0px)) + 12px + ${pullDistance * 0.75}px)`,
          opacity: showIndicator ? 1 : 0,
          transform: `translate(-50%, ${showIndicator ? "0px" : "-24px"}) scale(${0.7 + progress * 0.3})`,
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-lg text-xs font-medium text-foreground">
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Refreshing…</span>
            </>
          ) : (
            <>
              <ArrowDown
                className="w-4 h-4 text-primary transition-transform duration-200"
                style={{
                  transform: `rotate(${progress >= 1 ? 180 : progress * 180}deg)`,
                }}
              />
              <span>{progress >= 1 ? "Release to refresh" : "Pull down to refresh"}</span>
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
