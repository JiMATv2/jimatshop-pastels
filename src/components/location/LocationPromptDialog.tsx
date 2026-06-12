import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, X } from "lucide-react";
import { useLatestLocation } from "@/lib/location/useLocation";

const STORAGE_KEY = "jimatshop_location_prompt_asked";

const PROMPT_ROUTES = ["/", "/products", "/shops"];

export function LocationPromptDialog() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { coordinates, isLoading } = useLatestLocation();

  const hasCoordinates = Boolean(coordinates?.latitude && coordinates?.longitude);

  useEffect(() => {
    if (isLoading || hasCoordinates) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (!PROMPT_ROUTES.includes(pathname)) return;

    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, [isLoading, hasCoordinates, pathname]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  const handleSetLocation = () => {
    localStorage.setItem(STORAGE_KEY, "asked");
    setVisible(false);
    navigate("/location-search");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden
      />

      <div
        className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300"
        style={{ zIndex: 51 }}
        role="dialog"
        aria-labelledby="location-prompt-title"
        aria-describedby="location-prompt-description"
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto">
          <MapPin className="text-primary" size={28} />
        </div>

        <div className="text-center space-y-1">
          <h2 id="location-prompt-title" className="text-lg font-semibold text-foreground">
            Get a more personal experience
          </h2>
          <p id="location-prompt-description" className="text-sm text-muted-foreground leading-relaxed">
            Set your location to see nearby outlets, local deals, and products available in your area.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleSetLocation}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Set Location
          </button>
          <button
            onClick={dismiss}
            className="w-full py-2.5 rounded-xl text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
