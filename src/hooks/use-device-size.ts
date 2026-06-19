import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

type DeviceSize = "mobile" | "tablet" | "desktop";

function getDeviceSize(width: number): DeviceSize {
  if (width < MOBILE_BREAKPOINT) return "mobile";
  if (width < TABLET_BREAKPOINT) return "tablet";
  return "desktop";
}

export function useDeviceSize() {
  const [deviceSize, setDeviceSize] = React.useState<DeviceSize>(() =>
    typeof window !== "undefined" ? getDeviceSize(window.innerWidth) : "mobile",
  );

  React.useEffect(() => {
    const handleResize = () => {
      setDeviceSize(getDeviceSize(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceSize;
}

export function useIsMobile() {
  const deviceSize = useDeviceSize();
  return deviceSize === "mobile";
}

export function useIsTablet() {
  const deviceSize = useDeviceSize();
  return deviceSize === "tablet";
}

export function useIsTabletOrLarger() {
  const deviceSize = useDeviceSize();
  return deviceSize === "tablet" || deviceSize === "desktop";
}

export function useIsDesktop() {
  const deviceSize = useDeviceSize();
  return deviceSize === "desktop";
}
