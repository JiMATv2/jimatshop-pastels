import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ShoppingCart, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getGoogleIdToken } from "@/lib/auth/googleIdentity";
import { isMobilePlatform, signInWithGoogleNative } from "@/lib/auth/mobileAuth";
import { toast } from "@/components/ui/sonner";
import { useOnboarding } from "@/hooks/useOnboarding";
import { ResponsivePage } from "@/components/layout/ResponsivePageShell";

import { version } from "../../package.json";

const GROCERY_BACKGROUND = "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&q=80";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    title: "Welcome to JimatShop",
    description: "Buy groceries at wholesale prices directly from nearby retailers.",
    Icon: ShoppingCart,
  },
  {
    image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80",
    title: "Fast Delivery",
    description: "Your order is delivered straight to your doorstep within 24 hours.",
    Icon: Truck,
  },
];

interface LoginFormProps {
  isSignUp: boolean;
  submitting: boolean;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onGoogleLogin: () => void;
  onEmailAuth: (e: React.FormEvent) => void;
  onToggleSignUp: () => void;
  onGuestContinue: () => void;
}

function LoginForm({
  isSignUp,
  submitting,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onGoogleLogin,
  onEmailAuth,
  onToggleSignUp,
  onGuestContinue,
}: LoginFormProps) {
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex flex-col items-center md:items-start md:mb-8">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 shadow-lg">
          <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1 md:mb-2">JimatShop</h1>
        <p className="text-muted-foreground text-center md:text-left">
          {isSignUp ? "Create a new account" : "Sign in to continue"}
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 gap-3 bg-background hover:bg-muted"
        onClick={onGoogleLogin}
        disabled={submitting}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {submitting ? "Loading..." : "Continue with Google"}
      </Button>

      <div className="relative py-3">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-gradient-to-br from-jimat-pastelsage via-background to-jimat-pastelblue md:bg-background px-3 text-xs text-muted-foreground">
            or
          </span>
        </div>
      </div>

      <form onSubmit={onEmailAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={submitting}
            required
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={submitting}
            required
            className="h-12"
          />
        </div>
        <Button type="submit" className="w-full h-12" disabled={submitting}>
          {submitting ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
        </Button>
      </form>

      <p className="text-center md:text-left text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          className="text-primary font-medium hover:underline"
          onClick={onToggleSignUp}
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>

      <Button
        variant="ghost"
        className="w-full text-muted-foreground md:justify-start"
        onClick={onGuestContinue}
      >
        Continue as guest
      </Button>

      <div className="text-center md:text-left text-xs text-muted-foreground/60 pt-4" data-testid="app-version">
        v{version}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { markOnboardingSeen } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Allow direct navigation to the login "splash" (skip slides), e.g. after logout.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("login") === "1") {
      setShowLogin(true);
    }
  }, [location.search]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      markOnboardingSeen();
      navigate("/", { replace: true });
    }
  }, [authLoading, user, navigate, markOnboardingSeen]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setShowLogin(true);
    }
  };

  const handleSkip = () => {
    setShowLogin(true);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Account created successfully! Please check your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully!");
        markOnboardingSeen();
        navigate("/", { replace: true });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      const isMobile = isMobilePlatform();

      if (isMobile) {
        toast.info("Opening Google sign-in...");
        await signInWithGoogleNative();
        toast.success("Signed in successfully!");
        markOnboardingSeen();
        navigate("/", { replace: true });
        return;
      }

      // Web platform
      try {
        const idToken = await getGoogleIdToken();
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
        markOnboardingSeen();
        navigate("/", { replace: true });
      } catch (e) {
        const isUnregisteredOrigin = e instanceof Error && e.message.includes("unregistered_origin");
        if (isUnregisteredOrigin) {
          toast.error(
            "Google Sign-In Error: Domain/Origin not registered. Please add 'http://localhost:8082' to your Google Cloud Console JavaScript origins.",
          );
          throw e;
        }
        throw e;
      }
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : (() => {
                try {
                  return JSON.stringify(e);
                } catch {
                  return "Sign-in failed";
                }
              })();
      console.error("[auth][Onboarding] Google login failed:", msg, e);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestContinue = () => {
    markOnboardingSeen();
    navigate("/", { replace: true });
  };

  const loginFormProps: LoginFormProps = {
    isSignUp,
    submitting,
    email,
    password,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onGoogleLogin: handleGoogleLogin,
    onEmailAuth: handleEmailAuth,
    onToggleSignUp: () => setIsSignUp((prev) => !prev),
    onGuestContinue: handleGuestContinue,
  };

  if (showLogin) {
    return (
      <ResponsivePage
        mobile={
          <div className="min-h-screen bg-gradient-to-br from-jimat-pastelsage via-background to-jimat-pastelblue flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <LoginForm {...loginFormProps} />
            </div>
          </div>
        }
        tablet={
          <div className="min-h-screen bg-background flex">
            {/* Left: grocery background */}
            <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative items-end justify-start overflow-hidden">
              <img
                src={GROCERY_BACKGROUND}
                alt="Groceries"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
              <div className="relative z-10 p-10 lg:p-14 text-white">
                <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                  Barangan Runcit,
                  <br />
                  Harga Borong
                </h2>
                <p className="text-white/90 text-lg max-w-md">
                  Beli terus dari pengedar berdekatan. Jimat lebih, beli lebih.
                </p>
              </div>
            </div>

            {/* Right: login form */}
            <div className="w-full md:w-1/2 lg:w-[45%] flex items-center justify-center px-8 py-12 safe-area-x">
              <LoginForm {...loginFormProps} />
            </div>
          </div>
        }
      />
    );
  }

  // Onboarding slides
  const slide = slides[currentSlide];

  return (
    <ResponsivePage
      mobile={
        <div className="min-h-screen bg-background flex flex-col">
          {/* Skip button */}
          <div className="absolute top-4 right-4 z-10 safe-area-top">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip
            </Button>
          </div>

          {/* Image */}
          <div className="relative h-[55vh] overflow-hidden">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-8 flex flex-col">
            <div className="flex-1">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <slide.Icon className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{slide.title}</h2>
              <p className="text-muted-foreground text-lg">{slide.description}</p>
            </div>

            {/* Pagination & Next */}
            <div className="flex items-center justify-between pt-6">
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${idx === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
                      }`}
                  />
                ))}
              </div>
              <Button onClick={handleNext} size="lg" className="gap-2">
                {currentSlide < slides.length - 1 ? "Next" : "Get Started"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      }
      tablet={
        <div className="min-h-screen bg-background flex">
          {/* Left: grocery background */}
          <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative items-end justify-start overflow-hidden">
            <img
              src={GROCERY_BACKGROUND}
              alt="Groceries"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            <div className="relative z-10 p-10 lg:p-14 text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                Groceries,
                <br />
                Wholesale Prices
              </h2>
              <p className="text-white/90 text-lg max-w-md">
                Buy directly from retailers near you. Save more, buy more.
              </p>
            </div>
          </div>

          {/* Right: login form */}
          <div className="w-full md:w-1/2 lg:w-[45%] flex items-center justify-center px-8 py-12 safe-area-x">
            <LoginForm {...loginFormProps} />
          </div>
        </div>
      }
    />
  );
}
