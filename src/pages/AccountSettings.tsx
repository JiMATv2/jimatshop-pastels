import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Mail, Phone, Shield, Bell, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Capacitor } from "@capacitor/core";
import { notificationService } from "@/lib/notifications/notificationService";
import { deleteShopperAccount } from "@/lib/api/accountDeletion";
import { useEffect, useState } from "react";

const AccountSettings = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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

  const [isEditingShopper, setIsEditingShopper] = useState(false);
  const [isSavingShopper, setIsSavingShopper] = useState(false);
  const [shopperForm, setShopperForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    icNo: "",
    taxIdentificationNumber: "",
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const loginEmail = user?.email || "";
  const loginPhone = user?.phone || "";
  const contactEmail = shopper?.email || loginEmail || "";
  const contactPhone = shopper?.phone || loginPhone || "";

  // Load (or create) the linked shopper profile row for this auth user.
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
        setShopperForm({
          firstName: row?.first_name || (user.user_metadata?.given_name as string | undefined) || "",
          lastName: row?.last_name || (user.user_metadata?.family_name as string | undefined) || "",
          email: row?.email || user.email || "",
          phone: row?.phone || user.phone || "",
          icNo: row?.ic_no ?? "",
          taxIdentificationNumber: row?.tax_identification_number ?? "",
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load shopper profile";
        console.error("[profile/settings] failed to load shopper profile", e);
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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_notification_tokens" as any)
          .select("id, is_active")
          .eq("user_id", user.id);
        if (error) throw error;
        const hasActive = (data ?? []).some((row: { is_active: boolean }) => row.is_active);
        if (!cancelled) setNotificationsEnabled(hasActive);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load notification settings";
        console.error("[profile/settings] failed to load notification settings", e);
        toast.error(msg);
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    };

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleShopperSave = async () => {
    if (!user) return;
    setIsSavingShopper(true);
    try {
      const { error } = await supabase.rpc("upsert_shopper_for_auth_user", {
        first_name: shopperForm.firstName.trim(),
        last_name: shopperForm.lastName.trim() || null,
        email: (loginEmail || shopperForm.email).trim() || null,
        phone: shopperForm.phone.trim() || null,
        ic_no: shopperForm.icNo.trim() || null,
        tax_identification_number: shopperForm.taxIdentificationNumber.trim() || null,
      });
      if (error) throw error;

      toast.success("Shopper details updated");
      setIsEditingShopper(false);

      const { data, error: refreshErr } = await supabase
        .from("shoppers")
        .select(shopperSelectCols)
        .eq("user_id", user.id)
        .maybeSingle();
      if (refreshErr) throw refreshErr;
      setShopper((data as any) ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update shopper details";
      console.error("[profile/settings] failed to update shopper details", e);
      toast.error(msg);
    } finally {
      setIsSavingShopper(false);
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (!user) return;
    setNotificationsSaving(true);
    setNotificationsEnabled(enabled);
    try {
      if (enabled) {
        if (!notificationService.isNativePushEnabled() && Capacitor.isNativePlatform()) {
          throw new Error(
            "Push notifications are disabled in this build. Set VITE_ENABLE_ANDROID_PUSH=true and rebuild.",
          );
        }
        const token = await notificationService.requestPermissionAndGetToken(user.id);
        if (!token) {
          throw new Error(
            Capacitor.isNativePlatform()
              ? "Allow notifications in your device settings, then try again."
              : "Notification permission not granted",
          );
        }
      } else {
        const { error } = await supabase
          .from("user_notification_tokens" as any)
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        if (error) throw error;
      }
      toast.success(enabled ? "Notifications enabled" : "Notifications disabled");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update notifications";
      console.error("[profile/settings] failed to update notifications", e);
      toast.error(msg);
      setNotificationsEnabled(!enabled);
    } finally {
      setNotificationsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      toast.error("Email not available for account deletion.");
      return;
    }

    const confirmed = window.confirm(
      "This will permanently delete your account and anonymize your data. This action cannot be undone.",
    );
    if (!confirmed) return;

    setIsDeletingAccount(true);
    try {
      const result = await deleteShopperAccount({ email: user.email });
      if (!result?.success) {
        throw new Error(result?.message || "Failed to delete account.");
      }
      toast.success(result.message || "Account deletion request submitted.");
      await signOut();
      navigate("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete account.";
      toast.error(msg);
    } finally {
      setIsDeletingAccount(false);
    }
  };

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
              <CardDescription>Please sign in to view your account settings</CardDescription>
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-6 space-y-4">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
          <h1 className="text-xl font-bold">Account Settings</h1>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Login Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}
            {(contactEmail || shopperLoading) && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Contact Email</p>
                    <p className="text-sm text-muted-foreground">
                      {shopperLoading ? "Loading..." : contactEmail || "—"}
                    </p>
                  </div>
                </div>
              </>
            )}
            {(contactPhone || shopperLoading) && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Contact Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {shopperLoading ? "Loading..." : contactPhone || "—"}
                    </p>
                  </div>
                </div>
              </>
            )}
            <Separator />
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Account ID</p>
                <p className="text-sm text-muted-foreground font-mono text-xs">
                  {user.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shopper Details (editable) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Shopper Details</CardTitle>
              <CardDescription>Update the details used for orders and loyalty coins.</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditingShopper((v) => !v)}
              disabled={shopperLoading || isSavingShopper}
            >
              {isEditingShopper ? "Cancel" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {shopper?.member_no ? (
              <div className="text-xs text-muted-foreground">
                Member No: <span className="font-mono">{shopper.member_no}</span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="shopper_first_name">First name</Label>
                <Input
                  id="shopper_first_name"
                  value={shopperForm.firstName}
                  onChange={(e) => setShopperForm((p) => ({ ...p, firstName: e.target.value }))}
                  disabled={!isEditingShopper || isSavingShopper}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopper_last_name">Last name</Label>
                <Input
                  id="shopper_last_name"
                  value={shopperForm.lastName}
                  onChange={(e) => setShopperForm((p) => ({ ...p, lastName: e.target.value }))}
                  disabled={!isEditingShopper || isSavingShopper}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="shopper_email">Contact email</Label>
                <Input
                  id="shopper_email"
                  type="email"
                  value={shopperForm.email}
                  onChange={(e) => setShopperForm((p) => ({ ...p, email: e.target.value }))}
                  disabled={!isEditingShopper || isSavingShopper || Boolean(loginEmail)}
                  placeholder={loginEmail || "Email"}
                />
                {loginEmail ? (
                  <p className="text-xs text-muted-foreground">Uses your login email.</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopper_phone">Contact phone</Label>
                <Input
                  id="shopper_phone"
                  value={shopperForm.phone}
                  onChange={(e) => setShopperForm((p) => ({ ...p, phone: e.target.value }))}
                  disabled={!isEditingShopper || isSavingShopper}
                  placeholder={loginPhone || "Phone"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="shopper_ic_no">IC No</Label>
                <Input
                  id="shopper_ic_no"
                  value={shopperForm.icNo}
                  onChange={(e) => setShopperForm((p) => ({ ...p, icNo: e.target.value }))}
                  disabled={!isEditingShopper || isSavingShopper}
                  placeholder="IC No"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopper_tin">Tax Identification Number (TIN)</Label>
                <Input
                  id="shopper_tin"
                  value={shopperForm.taxIdentificationNumber}
                  onChange={(e) =>
                    setShopperForm((p) => ({ ...p, taxIdentificationNumber: e.target.value }))
                  }
                  disabled={!isEditingShopper || isSavingShopper}
                  placeholder="TIN"
                  autoComplete="off"
                />
              </div>
            </div>

            {isEditingShopper ? (
              <Button className="w-full" onClick={handleShopperSave} disabled={isSavingShopper}>
                {isSavingShopper ? "Saving..." : "Save shopper details"}
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>Manage order updates and promotional alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Push notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {notificationsLoading
                      ? "Loading status..."
                      : notificationsEnabled
                        ? "Enabled on this device"
                        : "Disabled"}
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
                disabled={notificationsLoading || notificationsSaving}
                aria-label="Toggle push notifications"
              />
            </div>
            {notificationsSaving ? (
              <p className="text-xs text-muted-foreground">Saving notification preference...</p>
            ) : null}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            <CardDescription>Actions that can result in account deletion.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Delete my account</p>
                <p className="text-xs text-muted-foreground">Request permanent account deletion.</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="w-full sm:w-auto"
              >
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default AccountSettings;
