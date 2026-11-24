import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, Package, Heart, MapPin, Coins, BookOpen, Settings, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useEffect, useMemo, useState, useRef } from "react";
import { getSavedLocation } from "@/pages/LocationSearch";
import type { SavedLocation } from "@/pages/LocationSearch";
import { useLatestLocation } from "@/lib/location/useLocation";
import { version } from "../../package.json";
import { ShopperWidgets } from "@/components/home/ShopperWidgets";
import { ResponsivePage, TabletContainer } from "@/components/layout/ResponsivePageShell";
import { BetaEnvironmentDialog, useSecretTapTrigger } from "@/components/dev/BetaEnvironmentDialog";
import { isBetaMode } from "@/lib/config/configService";
import {
  checkForOtaUpdate,
  downloadAndApplyOtaUpdate,
  type OtaCheckResult,
} from "@/lib/ota/otaService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [betaDialogOpen, setBetaDialogOpen] = useState(false);
  const handleSecretTap = useSecretTapTrigger(() => setBetaDialogOpen(true));
  const betaActive = isBetaMode();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const [otaUpdateInfo, setOtaUpdateInfo] = useState<OtaCheckResult | null>(null);

  const { location: sqliteLocation, refresh: refreshLocation } = useLatestLocation();
  const refreshLocationRef = useRef(refreshLocation);
  const [currentLocation, setCurrentLocation] = useState<SavedLocation | null>(
    sqliteLocation || getSavedLocation()
  );

  // Keep ref updated with latest refresh function
  useEffect(() => {
    refreshLocationRef.current = refreshLocation;
  }, [refreshLocation]);

  // Update location when SQLite location changes
  useEffect(() => {
    if (sqliteLocation) {
      setCurrentLocation((prev) => {
        // Only update if location actually changed
        if (prev?.coordinates?.latitude === sqliteLocation.coordinates?.latitude &&
          prev?.coordinates?.longitude === sqliteLocation.coordinates?.longitude) {
          return prev;
        }
        return sqliteLocation;
      });
    }
  }, [sqliteLocation]);

  // Update location when returning from location search page
  useEffect(() => {
    if (location.pathname === "/location-search") {
      return;
    }

    const timer = setTimeout(() => {
      refreshLocationRef.current();
      setCurrentLocation(getSavedLocation());
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Also listen for storage changes (for cross-tab updates)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "jimatshop_selected_location") {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          refreshLocationRef.current();
          setCurrentLocation(getSavedLocation());
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const shopperSelectCols =
    "id, first_name, last_name, email, phone, member_no, ic_no, tax_identification_number";

  const [shopperLoading, setShopperLoading] = useState(false);
  const [shopper, setShopper] = useState<{
    id: string;
    first_name: string;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    member_no: string | null;
    ic_no: string | null;
    tax_identification_number: string | null;
  } | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    `${user?.user_metadata?.given_name || ""} ${user?.user_metadata?.family_name || ""}`.trim() ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const displayNameFromShopper = useMemo(() => {
    const name = [shopper?.first_name, shopper?.last_name].filter(Boolean).join(" ").trim();
    return name || null;
  }, [shopper?.first_name, shopper?.last_name]);

  // Load the linked shopper profile row for this auth user to display name.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const load = async () => {
      setShopperLoading(true);
      try {
        const { data: byUserId, error: byUserIdErr } = await supabase
          .from("shoppers")
          .select(shopperSelectCols)
          .eq("user_id", user.id)
          .maybeSingle();
        if (byUserIdErr) throw byUserIdErr;

        let row = (byUserId as any) ?? null;

        // Legacy fallback (only if still unlinked): match by user's own email.
        if (!row && user.email) {
          const { data: byEmail, error: byEmailErr } = await supabase
            .from("shoppers")
            .select(shopperSelectCols)
            .ilike("email", user.email)
            .is("user_id", null)
            .maybeSingle();
          if (byEmailErr) throw byEmailErr;
          row = (byEmail as any) ?? null;
        }

        // Ensure a row exists (RPC creates/links if missing).
        if (!row) {
          const { error: upsertErr } = await supabase.rpc("upsert_shopper_for_auth_user", {
            first_name: (user.user_metadata?.given_name as string | undefined) || "",
            last_name: (user.user_metadata?.family_name as string | undefined) || null,
            email: user.email || null,
            phone: user.phone || null,
          });
          if (upsertErr) throw upsertErr;

          const { data: after, error: afterErr } = await supabase
            .from("shoppers")
            .select(shopperSelectCols)
            .eq("user_id", user.id)
            .maybeSingle();
          if (afterErr) throw afterErr;
          row = (after as any) ?? null;
        }

        if (cancelled) return;
        setShopper(row);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load shopper profile";
        console.error("[profile] failed to load shopper profile", e);
        toast.error(msg);
      } finally {
        if (!cancelled) setShopperLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>Please sign in to view your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} className="w-full">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  const profileHeaderCard = (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              {shopperLoading ? "Loading name..." : displayNameFromShopper || displayName}
            </h2>
            {user.email && (
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const quickActionsCard = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3"
          onClick={() => navigate("/account-settings")}
        >
          <Settings className="h-5 w-5" />
          <div className="flex-1 text-left">
            <p className="font-medium">Account Settings</p>
            <p className="text-xs text-muted-foreground">Manage profile details and notifications</p>
          </div>
        </Button>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3"
          onClick={() => navigate("/location-search")}
        >
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 text-left">
            <p className="font-medium">Current Location</p>
            <p className="text-xs text-muted-foreground">{currentLocation?.name || "Kuala Lumpur"}</p>
          </div>
        </Button>

        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3"
          onClick={() => navigate("/orders")}
        >
          <Package className="h-5 w-5" />
          <div className="flex-1 text-left">
            <p className="font-medium">My Orders</p>
            <p className="text-xs text-muted-foreground">View order history</p>
          </div>
        </Button>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3"
          onClick={() => navigate("/jimatshop-coins")}
        >
          <Coins className="h-5 w-5" />
          <div className="flex-1 text-left">
            <p className="font-medium">JiMATShop Coins</p>
            <p className="text-xs text-muted-foreground">View your coin balances</p>
          </div>
        </Button>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3"
          onClick={() => navigate("/wishlist")}
        >
          <Heart className="h-5 w-5" />
          <div className="flex-1 text-left">
            <p className="font-medium">Wishlist</p>
            <p className="text-xs text-muted-foreground">Saved items</p>
          </div>
        </Button>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3"
          onClick={() => navigate("/user-guide")}
          data-testid="profile-user-guide-btn"
        >
          <BookOpen className="h-5 w-5" />
          <div className="flex-1 text-left">
            <p className="font-medium">User Guide</p>
            <p className="text-xs text-muted-foreground">Learn how to use JimatShop</p>
          </div>
        </Button>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3"
          disabled={checkingUpdate}
          data-testid="profile-check-updates-btn"
          onClick={async () => {
            setCheckingUpdate(true);
            try {
              const result = await checkForOtaUpdate();
              if (result.isWeb) {
                toast.info(`You're on the latest web version (v${result.currentVersion}).`);
              } else if (result.error) {
                toast.error(`Unable to check updates: ${result.error}`);
              } else if (result.available && result.downloadUrl && result.latestVersion) {
                setOtaUpdateInfo(result);
              } else {
                toast.success(`App is up to date (v${result.currentVersion}).`);
              }
            } finally {
              setCheckingUpdate(false);
            }
          }}
        >
          <RefreshCw className={`h-5 w-5 ${checkingUpdate ? "animate-spin" : ""}`} />
          <div className="flex-1 text-left">
            <p className="font-medium">Check for Updates</p>
            <p className="text-xs text-muted-foreground">
              {checkingUpdate ? "Checking for new version..." : `Current version v${version}`}
            </p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );

  const signOutCard = (
    <Card>
      <CardContent className="pt-6">
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <>
      <ResponsivePage
        mobile={
          <div className="min-h-screen bg-background pb-24">
            <Header />
            <main className="px-4 py-6 space-y-4">
              {profileHeaderCard}
              <ShopperWidgets />
              {quickActionsCard}
              {signOutCard}
              <div
                className="text-center text-xs text-muted-foreground/60 pt-2 pb-4 cursor-pointer select-none"
                data-testid="app-version"
                onClick={handleSecretTap}
              >
                v{version}
                {betaActive && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-600 font-semibold">
                    BETA
                  </span>
                )}
              </div>
            </main>
            <BottomNav />
          </div>
        }
        tablet={
          <div className="min-h-screen bg-background pb-28">
            <Header />
            <TabletContainer>
              <main className="py-6 space-y-6">
                <div className="grid grid-cols-12 gap-8 items-start">
                  {/* Left Side: Profile info & Sign Out */}
                  <div className="col-span-4 space-y-6">
                    {profileHeaderCard}
                    {signOutCard}
                    <div
                      className="text-center text-xs text-muted-foreground/60 pt-2 cursor-pointer select-none"
                      data-testid="app-version"
                      onClick={handleSecretTap}
                    >
                      v{version}
                      {betaActive && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-600 font-semibold">
                          BETA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Widgets & Quick Actions */}
                  <div className="col-span-8 space-y-6">
                    <ShopperWidgets />
                    {quickActionsCard}
                  </div>
                </div>
              </main>
            </TabletContainer>
            <BottomNav />
          </div>
        }
      />
      <BetaEnvironmentDialog open={betaDialogOpen} onOpenChange={setBetaDialogOpen} />
      <Dialog
        open={Boolean(otaUpdateInfo?.available)}
        onOpenChange={(open) => {
          if (!open && !installingUpdate) setOtaUpdateInfo(null);
        }}
      >
        <DialogContent className="max-w-sm w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update Available (v{otaUpdateInfo?.latestVersion})</DialogTitle>
            <DialogDescription>
              {otaUpdateInfo?.releaseNotes ||
                `A new version (v${otaUpdateInfo?.latestVersion}) is ready to download and install.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            {!otaUpdateInfo?.mandatory && (
              <Button
                type="button"
                variant="outline"
                disabled={installingUpdate}
                onClick={() => setOtaUpdateInfo(null)}
              >
                Later
              </Button>
            )}
            <Button
              type="button"
              disabled={installingUpdate}
              onClick={async () => {
                if (!otaUpdateInfo?.downloadUrl || !otaUpdateInfo?.latestVersion) return;
                setInstallingUpdate(true);
                try {
                  await downloadAndApplyOtaUpdate({
                    url: otaUpdateInfo.downloadUrl,
                    version: otaUpdateInfo.latestVersion,
                    checksum: otaUpdateInfo.checksum,
                  });
                } catch (err: any) {
                  toast.error(err?.message || "Failed to install update");
                  setInstallingUpdate(false);
                }
              }}
            >
              {installingUpdate ? "Downloading..." : "Update Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;

