import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  getCurrentEnvironment,
  switchEnvironment,
  isBetaMode,
  getLabel,
} from '@/lib/config/configService';
import {
  BETA_DEV_PIN,
  ENABLE_BETA_CAPABILITIES,
  ENVIRONMENTS,
} from '@/config/resources';
import {
  checkForOtaUpdate,
  downloadAndApplyOtaUpdate,
  resetToBuiltinBundle,
} from '@/lib/ota/otaService';
import { toast } from '@/components/ui/sonner';
import { Server, ShieldAlert, FlaskConical, RefreshCw, RotateCcw } from 'lucide-react';

interface BetaEnvironmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BetaEnvironmentDialog: React.FC<BetaEnvironmentDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const currentEnv = getCurrentEnvironment();
  const [selectedEnv, setSelectedEnv] = useState<'production' | 'staging'>(currentEnv);
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otaBusy, setOtaBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedEnv(getCurrentEnvironment());
      setPin('');
      setPinError('');
    }
  }, [open]);

  if (!ENABLE_BETA_CAPABILITIES) {
    return null;
  }

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === BETA_DEV_PIN) {
      setIsUnlocked(true);
      setPinError('');
    } else {
      setPinError('Invalid beta tester PIN. Access denied.');
    }
  };

  const handleSave = async () => {
    if (selectedEnv === currentEnv) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    await switchEnvironment(selectedEnv);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="h-5 w-5 text-amber-500" />
            <DialogTitle className="text-lg font-bold">
              {getLabel('switch_env_title', 'Developer / Beta Environment')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {getLabel(
              'switch_env_desc',
              'Select backend environment. Switching reloads the app and resets the session.',
            )}
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <form onSubmit={handleVerifyPin} className="space-y-4 py-2">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                This screen is restricted to authorized testers. Please enter your beta tester PIN.
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="beta-pin" className="text-xs font-semibold">
                {getLabel('prompt_pin_label', 'Enter Beta Tester PIN')}
              </Label>
              <Input
                id="beta-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError('');
                }}
                className="text-center text-lg tracking-widest font-mono"
                autoFocus
              />
              {pinError && <p className="text-xs text-destructive font-medium">{pinError}</p>}
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                {getLabel('btn_cancel', 'Cancel')}
              </Button>
              <Button type="submit" size="sm" disabled={!pin.trim()}>
                Unlock
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Host Target
              </Label>
              <RadioGroup
                value={selectedEnv}
                onValueChange={(val) => setSelectedEnv(val as 'production' | 'staging')}
                className="space-y-2.5"
              >
                {/* Production Option */}
                <label
                  htmlFor="env-prod"
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedEnv === 'production'
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <RadioGroupItem value="production" id="env-prod" className="mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Production</span>
                      {currentEnv === 'production' && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 font-mono text-[11px] truncate">
                      {ENVIRONMENTS.production.apiHost}
                    </p>
                  </div>
                </label>

                {/* Staging Option */}
                <label
                  htmlFor="env-staging"
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedEnv === 'staging'
                      ? 'border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-500'
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <RadioGroupItem value="staging" id="env-staging" className="mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        Staging (Beta)
                      </span>
                      {currentEnv === 'staging' && (
                        <Badge
                          variant="default"
                          className="text-[10px] py-0 px-1.5 h-4 bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 font-mono text-[11px] truncate">
                      {ENVIRONMENTS.staging.apiHost}
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <div className="rounded-lg bg-muted/60 p-3 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Server className="h-3.5 w-3.5" />
                <span>Notice</span>
              </div>
              <p>
                Changing the environment clears your local session tokens and restarts the app to bind to the selected host.
              </p>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                OTA Bundle Controls
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5"
                  disabled={otaBusy}
                  onClick={async () => {
                    setOtaBusy(true);
                    try {
                      const res = await checkForOtaUpdate();
                      if (res.isWeb) {
                        toast.info('Web build updates automatically on page refresh.');
                      } else if (res.error) {
                        toast.error(`OTA check failed: ${res.error}`);
                      } else if (res.available && res.downloadUrl && res.latestVersion) {
                        toast.info(`Downloading OTA v${res.latestVersion}...`);
                        await downloadAndApplyOtaUpdate({
                          url: res.downloadUrl,
                          version: res.latestVersion,
                          checksum: res.checksum,
                        });
                      } else {
                        toast.success(`Up to date (v${res.currentVersion})`);
                      }
                    } finally {
                      setOtaBusy(false);
                    }
                  }}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${otaBusy ? 'animate-spin' : ''}`} />
                  Pull OTA
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5"
                  disabled={otaBusy}
                  onClick={async () => {
                    setOtaBusy(true);
                    try {
                      await resetToBuiltinBundle();
                      toast.success('Reverted to built-in store bundle.');
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to reset bundle');
                    } finally {
                      setOtaBusy(false);
                    }
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Bundle
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {getLabel('btn_cancel', 'Cancel')}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSubmitting}
                className={selectedEnv === 'staging' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
              >
                {isSubmitting ? 'Switching...' : getLabel('btn_save_restart', 'Save & Switch Host')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Secret tap hook: triggers callback when user taps an element 7 times in 3 seconds.
 */
export function useSecretTapTrigger(onTrigger: () => void, requiredTaps = 7, timeoutMs = 3000) {
  const tapCount = useRef(0);
  const lastTapTime = useRef(0);

  return () => {
    if (!ENABLE_BETA_CAPABILITIES) return;

    const now = Date.now();
    if (now - lastTapTime.current > timeoutMs) {
      tapCount.current = 1;
    } else {
      tapCount.current += 1;
    }
    lastTapTime.current = now;

    if (tapCount.current >= requiredTaps) {
      tapCount.current = 0;
      onTrigger();
    }
  };
}

/**
 * Floating or header badge displayed when the app is running in Staging mode.
 */
export const StagingModeBanner: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);

  if (!isBetaMode() || !ENABLE_BETA_CAPABILITIES) {
    return null;
  }

  return (
    <>
      <div
        onClick={() => setOpenDialog(true)}
        className="w-full bg-amber-500 text-white text-[11px] font-semibold py-1 px-3 text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none z-50"
      >
        <FlaskConical className="h-3.5 w-3.5 animate-pulse" />
        <span>STAGING BACKEND: {ENVIRONMENTS.staging.apiHost} (Tap to change)</span>
      </div>
      <BetaEnvironmentDialog open={openDialog} onOpenChange={setOpenDialog} />
    </>
  );
};
