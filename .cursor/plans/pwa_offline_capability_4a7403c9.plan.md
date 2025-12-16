---
name: PWA Offline Capability
overview: Convert the app into an offline-capable PWA by installing vite-plugin-pwa, configuring runtime caching for XML assets, and registering the service worker for automatic updates.
todos:
  - id: install-deps
    content: Install vite-plugin-pwa and workbox-window as dev dependencies
    status: completed
  - id: configure-vite-pwa
    content: Update vite.config.ts to add VitePWA plugin with autoUpdate, manifest config, and runtime caching for /assets/*.xml
    status: completed
  - id: register-sw
    content: Add service worker registration in index.tsx using workbox-window
    status: completed
  - id: verify-build
    content: Verify build generates sw.js and manifest.webmanifest files
    status: completed
---

# PWA Offline Capability Implementation

## Overview

Convert the Tomlinson 10 app into an offline-capable Progressive Web App that caches the app shell and all XML Bible data files, enabling full functionality without internet after the first load.

## Current State Analysis

- **Entry Point**: [`index.tsx`](index.tsx) - React app initialization
- **Asset Loading**: 
- Bible books: Dynamic fetch from `/assets/*.xml` in [`services/BibleEngine.ts`](services/BibleEngine.ts) (line 100)
- Dictionary files: `/assets/strongs_greek.xml` and `/assets/strongs_hebrew.xml` in [`services/DictionaryService.ts`](services/DictionaryService.ts) (lines 17, 22)
- **Build Tool**: Vite 6.2.0 with React plugin
- **No existing PWA setup**: No service worker or manifest files present

## Implementation Plan

### 1. Install Dependencies

Add PWA dependencies to `package.json`:

- `vite-plugin-pwa` - Vite plugin for PWA generation
- `workbox-window` - Service worker registration and update management

### 2. Configure Vite PWA Plugin

Update [`vite.config.ts`](vite.config.ts) to include `VitePWA` plugin with:

**Core Configuration:**

- `registerType: 'autoUpdate'` - Automatically update service worker when new version is available
- `includeAssets` - Pattern to include all XML files from `public/assets/` directory
- `manifest` - Generate web app manifest with:
- `name`: "Tomlinson 10"
- `short_name`: "Tomlinson"
- `theme_color`: Match app theme (slate-950: `#0f172a`)
- `icons`: Generate icons (or use placeholder icons)

**Runtime Caching Strategy:**

- Configure Workbox runtime caching for `/assets/*.xml` requests
- Use `NetworkFirst` or `CacheFirst` strategy for XML files (NetworkFirst recommended for updates)
- Cache all static assets (JS, CSS, images)

**Workbox Options:**

- `globPatterns`: Include all XML files in `public/assets/**/*.xml`
- `runtimeCaching`: Add rule for `/assets/*.xml` with appropriate strategy

### 3. Service Worker Registration

Update [`index.tsx`](index.tsx) to register the service worker:

**Option A (Recommended)**: Use `workbox-window` for better update handling:

- Import `Workbox` from `workbox-window`
- Register service worker after React root is created
- Handle update notifications (optional: show toast when update is available)

**Option B**: Use standard service worker registration API

**Implementation Details:**

- Register service worker early in app lifecycle (after DOM ready)
- Handle registration errors gracefully
- Log registration status for debugging

### 4. Update HTML Meta Tags

Update [`index.html`](index.html) to include:

- PWA meta tags (theme-color, viewport already present)
- Link to generated manifest (VitePWA will inject this automatically)

## Technical Considerations

### XML File Caching

Since XML files are fetched dynamically via `fetch()` calls:

- Runtime caching rules must match the fetch URL pattern (`/assets/*.xml`)
- Consider using `NetworkFirst` strategy to allow updates while falling back to cache offline
- Ensure all 60+ XML files in `public/assets/` are included in precache or runtime cache

### Service Worker Updates

With `registerType: 'autoUpdate'`:

- Service worker updates automatically when new version is deployed
- Users get updates without manual refresh
- Consider adding update notification UI (optional enhancement)

### Cloudflare Pages Deployment

- Ensure `sw.js` and `manifest.webmanifest` are served with correct MIME types
- Cloudflare Pages should handle this automatically for generated files
- Test offline functionality after deployment

## Files to Modify

1. **`package.json`** - Add dev dependencies
2. **`vite.config.ts`** - Add VitePWA plugin configuration
3. **`index.tsx`** - Add service worker registration
4. **`index.html`** - (Optional) Add any additional PWA meta tags if needed

## Testing Checklist

- [ ] Service worker registers successfully
- [ ] App loads offline after first visit
- [ ] XML files are cached and load offline
- [ ] Dictionary files load offline
- [ ] App shell (HTML, JS, CSS) loads offline
- [ ] Service worker updates automatically on new deployment
- [ ] Build generates `sw.js` and `manifest.webmanifest`

## Expected Build Output

After `npm run build`, the `dist/` directory should contain:

- `sw.js` - Service worker file
- `manifest.webmanifest` - Web app manifest
- All precached assets listed in service worker