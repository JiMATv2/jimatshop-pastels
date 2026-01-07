import { Search, ShoppingCart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getGoogleIdToken } from "@/lib/auth/googleIdentity";
import { supabase } from "@/lib/supabase/client";
import { shopLoginWithGoogleIdToken } from "@/lib/api/jimatshopSession";
import { toast } from "@/components/ui/sonner";

export const Header = () => {
  const { user, loading, signOut } = useAuth();

  const onLogin = async () => {
    try {
      const idToken = await getGoogleIdToken();

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) throw error;

      // Link / upsert shopper profile in Supabase (server-side RPC).
      const { error: shopperUpsertError } = await supabase.rpc("upsert_shopper_for_auth_user", {
        first_name:
          (data.user?.user_metadata?.given_name as string | undefined) ||
          (data.user?.user_metadata?.full_name as string | undefined) ||
          (data.user?.user_metadata?.name as string | undefined) ||
          "",
        last_name: (data.user?.user_metadata?.family_name as string | undefined) || null,
        email: (data.user?.email as string | undefined) || null,
        phone: (data.user?.phone as string | undefined) || null,
      });
      if (shopperUpsertError) {
        // eslint-disable-next-line no-console
        console.warn("[auth] upsert_shopper_for_auth_user failed", shopperUpsertError);
      }

      // Optional: exchange Google id_token for legacy API auth token (Phoenix).
      try {
        const apiToken = await shopLoginWithGoogleIdToken({
          idToken,
          email: data.user?.email ?? undefined,
          name:
            (data.user?.user_metadata?.full_name as string | undefined) ||
            (data.user?.user_metadata?.name as string | undefined) ||
            undefined,
        });
        localStorage.setItem("jimatshop_api_token", apiToken);
      } catch {
        // If the API URL isn't configured, skip legacy token exchange.
      }

      toast.success("Signed in");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      // eslint-disable-next-line no-console
      console.error("[auth] sign-in failed", e);
      toast.error(msg);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
      <div className="container mx-auto px-4 py-3">
        {/* Logo and Location */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">J</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">JimatShop</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Kuala Lumpur</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!loading && !user ? (
              <Button variant="secondary" size="sm" onClick={onLogin}>
                Sign in
              </Button>
            ) : null}
            {!loading && user ? (
              <Button variant="ghost" size="sm" onClick={signOut}>
                Logout
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for groceries..."
            className="pl-10 bg-muted border-0 focus-visible:ring-primary"
          />
        </div>
      </div>
    </header>
  );
};
