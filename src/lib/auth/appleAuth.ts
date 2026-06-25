import { Capacitor } from "@capacitor/core";
import type {
  SignInWithAppleResponse,
  SignInWithAppleOptions,
} from "@capacitor-community/apple-sign-in";

/**
 * Safely stringify an error-like value for logs so we never end up with
 * `[object Object]` in the native logs.
 */
function describeError(err: unknown): string {
  if (!err) return "unknown error";
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function randomId(length = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export type AppleSignInResult = {
  identityToken: string;
  authorizationCode: string;
  user: string | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  fullName: string | null;
};

/**
 * Native Sign in with Apple for iOS.
 *
 * Returns the Apple identity token (JWT) so it can be verified by the
 * ex_supabase backend at /supabase/auth/apple.
 */
export async function signInWithAppleNative(): Promise<AppleSignInResult> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("signInWithAppleNative should only be called on mobile platforms");
  }

  if (Capacitor.getPlatform() !== "ios") {
    throw new Error("Sign in with Apple is only supported on iOS");
  }

  const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");

  const options: SignInWithAppleOptions = {
    clientId: "com.jimatbiz.shop3-1",
    redirectURI: "https://ex_supabase.jimatbiz.com/auth/apple/callback",
    scopes: "email name",
    state: randomId(16),
    nonce: randomId(16),
  };

  console.log("[auth][apple] calling SignInWithApple.authorize with options:", {
    clientId: options.clientId,
    scopes: options.scopes,
    hasRedirectURI: !!options.redirectURI,
    hasState: !!options.state,
    hasNonce: !!options.nonce,
  });

  let result: SignInWithAppleResponse;
  try {
    result = await SignInWithApple.authorize(options);
    console.log("[auth][apple] SignInWithApple.authorize resolved", {
      hasResponse: !!result?.response,
      keys: result?.response ? Object.keys(result.response) : [],
    });
  } catch (err) {
    console.error("[auth][apple] SignInWithApple.authorize failed:", describeError(err));
    throw new Error(`Apple sign-in cancelled or failed: ${describeError(err)}`);
  }

  const response = result?.response;
  if (!response?.identityToken) {
    console.error("[auth][apple] no identity token in response", {
      responseKeys: response ? Object.keys(response) : null,
      response,
    });
    throw new Error("Apple sign-in did not return an identity token");
  }

  const givenName = response.givenName ?? null;
  const familyName = response.familyName ?? null;
  const fullName =
    givenName || familyName
      ? [givenName, familyName].filter(Boolean).join(" ").trim() || null
      : null;

  console.log("[auth][apple] identity token present", {
    hasEmail: !!response.email,
    email: response.email ?? null,
    hasGivenName: !!givenName,
    hasFamilyName: !!familyName,
    hasFullName: !!fullName,
    hasUser: !!response.user,
    user: response.user ?? null,
    authorizationCodeLength: response.authorizationCode?.length ?? 0,
    identityTokenLength: response.identityToken.length,
    identityTokenPrefix: response.identityToken.slice(0, 20) + "...",
  });

  return {
    identityToken: response.identityToken,
    authorizationCode: response.authorizationCode,
    user: response.user ?? null,
    email: response.email ?? null,
    givenName,
    familyName,
    fullName,
  };
}
