import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useLatestLocation } from "@/lib/location/useLocation";
import { saveCurrentLocation } from "@/lib/location/storage";
import { geoAutocomplete, geoPlace } from "@/lib/api/geoLocation";
import { saveLocation } from "@/pages/LocationSearch";

interface MockProductLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MockProductLocationModal({ open, onOpenChange }: MockProductLocationModalProps) {
  const navigate = useNavigate();
  const { refresh } = useLatestLocation();
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleTakeMeThere = () => {
    onOpenChange(false);
    navigate("/location-search");
  };

  const attachName = (item: { area?: string | null; city?: string | null; main_text?: string | null; secondary_text?: string | null }) => {
    if (item.area && item.city) return `${item.area}, ${item.city}`;
    if (item.main_text) return item.main_text;
    return item.secondary_text || "Selected Location";
  };

  const handleUseDefaultLocation = async () => {
    setIsSettingDefault(true);
    try {
      const results = await geoAutocomplete("Petaling Jaya");
      const item = results[0];
      if (!item) {
        throw new Error("No results found for Petaling Jaya");
      }

      const place = await geoPlace(item.place_id);
      const coords = place.lnglat;
      if (typeof coords.lat !== "number" || typeof coords.lng !== "number") {
        throw new Error("Invalid coordinates returned for Petaling Jaya");
      }

      await saveCurrentLocation({ latitude: coords.lat, longitude: coords.lng });

      const savedLocation = {
        name: attachName(item),
        address: [item.main_text, item.secondary_text].filter(Boolean).join(", "),
        coordinates: {
          latitude: coords.lat,
          longitude: coords.lng,
        },
      };
      saveLocation(savedLocation);

      window.dispatchEvent(new CustomEvent("jimatshop-location-updated"));

      toast.success(`Location set to "${savedLocation.name}"`);
      await refresh();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to set default location";
      toast.error(message);
      console.error("[MockProductLocationModal] Failed to set default location", error);
    } finally {
      setIsSettingDefault(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-3">
            <MapPin className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle>Choose a location</DialogTitle>
          <DialogDescription>
            You need to choose a location to show the most personalized products for you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            className="w-full"
            onClick={handleTakeMeThere}
            disabled={isSettingDefault}
          >
            Take me there
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleUseDefaultLocation}
            disabled={isSettingDefault}
          >
            {isSettingDefault ? "Setting location…" : "Use default location (Petaling Jaya)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
