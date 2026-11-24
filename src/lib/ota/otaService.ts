import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { getExSupabaseEndpoint } from '@/lib/config/configService';
import { version as appVersion } from '../../../package.json';

export interface OtaManifest {
  version: string;
  url: string;
  checksum?: string;
  mandatory?: boolean;
  releaseNotes?: string;
}

export interface OtaCheckResult {
  available: boolean;
  isWeb?: boolean;
  currentVersion: string;
  latestVersion?: string;
  downloadUrl?: string;
  checksum?: string;
  mandatory?: boolean;
  releaseNotes?: string;
  error?: string;
}

/**
 * Simple semver comparison: returns true if `latest` > `current`.
 */
function isNewerVersion(latest: string, current: string): boolean {
  const clean = (v: string) => v.replace(/^v/, '').split('-')[0].split('.').map(Number);
  const a = clean(latest);
  const b = clean(current);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const numA = a[i] || 0;
    const numB = b[i] || 0;
    if (numA > numB) return true;
    if (numA < numB) return false;
  }
  return false;
}

/**
 * Must be called on app startup so @capgo/capacitor-updater knows the current
 * bundle booted successfully and does not roll back.
 */
export async function initOta(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await CapacitorUpdater.notifyAppReady();
  } catch (err) {
    console.warn('[ota] notifyAppReady failed:', err);
  }
}

/**
 * Returns the currently active bundle version (OTA bundle version or built-in package version).
 */
export async function getCurrentBundleVersion(): Promise<string> {
  if (!Capacitor.isNativePlatform()) {
    return appVersion;
  }
  try {
    const current = await CapacitorUpdater.current();
    const bundleVersion = current?.bundle?.version;
    if (bundleVersion && bundleVersion !== 'builtin') {
      return bundleVersion;
    }
    return current?.native || appVersion;
  } catch {
    return appVersion;
  }
}

/**
 * Checks the active backend host (Production or Staging) for a newer OTA web bundle.
 * Expected endpoint: GET {apiHost}/api/mobile/ota/latest?platform=android|ios&version=1.12.0
 */
export async function checkForOtaUpdate(): Promise<OtaCheckResult> {
  const currentVersion = await getCurrentBundleVersion();

  if (!Capacitor.isNativePlatform()) {
    return {
      available: false,
      isWeb: true,
      currentVersion,
    };
  }

  const endpoint = `${getExSupabaseEndpoint().replace(/\/+$/, '')}/api/mobile/ota/latest`;
  const params = new URLSearchParams({
    platform: Capacitor.getPlatform(),
    version: currentVersion,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        available: false,
        currentVersion,
        error: `Update server returned HTTP ${response.status}`,
      };
    }

    const manifest = (await response.json()) as Partial<OtaManifest>;
    if (!manifest?.version || !manifest?.url) {
      return {
        available: false,
        currentVersion,
      };
    }

    const available = isNewerVersion(manifest.version, currentVersion);
    return {
      available,
      currentVersion,
      latestVersion: manifest.version,
      downloadUrl: manifest.url,
      checksum: manifest.checksum,
      mandatory: manifest.mandatory,
      releaseNotes: manifest.releaseNotes,
    };
  } catch (err: any) {
    return {
      available: false,
      currentVersion,
      error: err?.name === 'AbortError' ? 'Update check timed out' : err?.message || 'Network error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Downloads the OTA zip bundle and switches the WebView to it immediately.
 */
export async function downloadAndApplyOtaUpdate(options: {
  url: string;
  version: string;
  checksum?: string;
}): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    window.location.reload();
    return;
  }

  const bundle = await CapacitorUpdater.download({
    url: options.url,
    version: options.version,
    ...(options.checksum ? { checksum: options.checksum } : {}),
  });

  await CapacitorUpdater.set({ id: bundle.id });
}

/**
 * Resets the app back to the built-in store bundle.
 */
export async function resetToBuiltinBundle(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await CapacitorUpdater.reset();
}
