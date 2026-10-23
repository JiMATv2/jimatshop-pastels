# JimatShop Pastels

Fresh groceries and local shop delivery frontend for JimatShop, built with React, Vite, Tailwind CSS, and shadcn/ui.

## Technologies Used

- Vite
- TypeScript
- React
- Tailwind CSS & shadcn/ui
- Capacitor (iOS & Android native apps)
- TanStack Query
- Backend API Gateway: `ex_supabase` (`https://exsupabase.jimatlabs.com`)

## Development

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview --host 0.0.0.0 --port 4184
```

## Mobile Development (Capacitor)

```bash
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$PATH:$ANDROID_SDK_ROOT/platform-tools"

# Sync web assets to native project
pnpm build && npx cap sync android

# Run on Android emulator / device
npx cap run android -l --host 10.0.2.2 --port 8080 --target Medium_Phone_API_36.1

# Build APK / Bundle
cd android && ./gradlew assembleDebug
cd android && ./gradlew bundleRelease
```
