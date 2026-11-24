import { Preferences } from '@capacitor/preferences';
import {
  ENVIRONMENTS,
  EnvironmentConfig,
  DEFAULT_LABELS,
  AppLabelKey,
  ENABLE_BETA_CAPABILITIES,
} from '@/config/resources';

const STORAGE_KEY_ENV = 'jimat_app_environment';

/**
 * Determine synchronous initial environment.
 * If beta capabilities are disabled at build time, always lock to production.
 */
function getInitialEnvironment(): EnvironmentConfig {
  if (!ENABLE_BETA_CAPABILITIES) {
    return ENVIRONMENTS.production;
  }

  try {
    const cached = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ENV) : null;
    if (cached && (cached === 'staging' || cached === 'production')) {
      return ENVIRONMENTS[cached];
    }
  } catch {
    // ignore local storage errors
  }

  return ENVIRONMENTS.production;
}

// In-memory active configuration
let activeConfig: EnvironmentConfig = getInitialEnvironment();

/**
 * Initialize config by reading from Capacitor Preferences (native device persistence).
 * Call this in bootstrap() during application startup.
 */
export async function initAppConfig(): Promise<EnvironmentConfig> {
  if (!ENABLE_BETA_CAPABILITIES) {
    activeConfig = ENVIRONMENTS.production;
    return activeConfig;
  }

  try {
    const { value: storedEnv } = await Preferences.get({ key: STORAGE_KEY_ENV });
    if (storedEnv && (storedEnv === 'staging' || storedEnv === 'production')) {
      activeConfig = ENVIRONMENTS[storedEnv];
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ENV, storedEnv);
      }
    } else {
      activeConfig = ENVIRONMENTS.production;
    }
  } catch (err) {
    console.warn('[configService] Failed to load preferences, using fallback:', err);
  }

  return activeConfig;
}

export function getCurrentConfig(): EnvironmentConfig {
  return activeConfig;
}

export function getCurrentEnvironment(): 'production' | 'staging' {
  return activeConfig.name;
}

export function getExSupabaseEndpoint(): string {
  return activeConfig.apiHost;
}

export function getSupabaseUrl(): string {
  return activeConfig.supabaseUrl;
}

export function getSupabaseAnonKey(): string {
  return activeConfig.anonKey;
}

export function isBetaMode(): boolean {
  return activeConfig.name === 'staging';
}

export function getLabel(key: AppLabelKey, fallback?: string): string {
  return DEFAULT_LABELS[key] ?? fallback ?? '';
}

/**
 * Switch environment, persist across app restarts, clean cached tokens, and reload.
 */
export async function switchEnvironment(env: 'production' | 'staging'): Promise<void> {
  if (!ENABLE_BETA_CAPABILITIES && env !== 'production') {
    console.warn('[configService] Beta capabilities are disabled in this build.');
    return;
  }

  activeConfig = ENVIRONMENTS[env];

  try {
    await Preferences.set({ key: STORAGE_KEY_ENV, value: env });
  } catch (err) {
    console.error('[configService] Failed to write preference:', err);
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ENV, env);
      // Clean auth session tokens to avoid token mismatch between staging and production
      localStorage.removeItem('native_session');
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch {
    // ignore storage error
  }

  // Reload window to re-initialize all modules and connections cleanly
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export async function resetToProduction(): Promise<void> {
  await switchEnvironment('production');
}
