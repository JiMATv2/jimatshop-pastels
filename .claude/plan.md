# Plan: Mock-product click should ask for location instead of erroring

## Goal
On the Index page, when no location is set, the product grids fall back to the local seed ("mock") catalog. Clicking one of those cards currently navigates to `/product/:id`, where the product doesn't exist in the buyer-inventory API and shows a "Product not found" error.

Instead, tapping a mock product card should open a modal telling the user to choose a location, with two actions:
1. **"Take me there"** → navigate to `/location-search`.
2. **"Use default location (Petaling Jaya)"** → geocode "Petaling Jaya", save it as the current location, and let the product grids reload with real nearby inventory.

## Files to change

1. `src/components/home/ProductSection.tsx`
   - Detect when the rendered list is the mock/local catalog because the user has no location.
   - Accept a new optional prop `onMockProductClick?: () => void`.
   - Pass `isMock={isMockCatalog}` and `onMockClick={onMockProductClick}` to each `ProductCard`.

2. `src/components/home/ProductCard.tsx`
   - Add optional props `isMock?: boolean` and `onMockClick?: () => void`.
   - When `isMock` is true, the card click calls `onMockClick` instead of navigating to `/product/:id`.

3. `src/components/location/MockProductLocationModal.tsx` (new)
   - Shadcn `Dialog` matching the app style.
   - Title/description: "You need to choose a location to show the most personalized products for you."
   - Two CTAs:
     - **Take me there** → `navigate("/location-search")` and close.
     - **Use default location (Petaling Jaya)** →
       - call `geoAutocomplete("Petaling Jaya")`,
       - pick the first result and call `geoPlace(...)` for coordinates,
       - persist via `saveCurrentLocation(...)` and `saveLocation(...)` (same as `LocationSearch`),
       - call `useLatestLocation().refresh()` so dependent queries refetch,
       - show a success toast and close.
   - A cancel/close control.

4. `src/pages/Index.tsx`
   - Add state for the modal (`locationModalOpen`).
   - Pass `onMockProductClick={() => setLocationModalOpen(true)}` to every `ProductSection` instance.
   - Render `<MockProductLocationModal open={...} onOpenChange={...} />` after the page content.

## How it will behave
- If the user has already set a location, `isMockCatalog` is false and `ProductCard` navigates normally.
- If no location is set, the cards are marked mock, and clicking any of them opens the location prompt modal.
- Choosing **Petaling Jaya** will immediately set and persist that location; `ProductSection` will refetch real nearby products once the new coordinates flow through `useLatestLocation` → `useNearbyBuyerIds`.
- The modal will only treat cards as mock when the API token is configured (the usual case); in dev with no token the offline catalog is intentional, so we won't block navigation there.

## Assumptions
- "Set the location search params to 'Petaling Jaya', then set the location" means geocode that query via the existing `geoAutocomplete`/`geoPlace` flow and persist the resulting coordinates/name the same way `LocationSearch.tsx` does.
- A simple Shadcn centered dialog is acceptable; no custom bottom-sheet styling is required unless you prefer it.
