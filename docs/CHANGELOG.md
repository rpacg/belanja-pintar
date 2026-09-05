# Changelog

All notable changes to Belanja Pintar are documented here.

## 1.3.0 - 2026-09-06

### Added

- Added the Analytics menu with category budget bars, price history, and monthly purchase history.
- Added shopping item units, notes, percentage discounts, quick-add items, and category filtering.
- Added CSV export with item details, discounts, notes, and completion status.
- Added saved-list search, favorites, archive status, totals, duplicate, rename, and delete actions.
- Added currency selection for IDR, USD, and SGD.
- Added system, light, and dark theme modes.
- Added budget notifications, PWA installation guidance, reset data, and data-saver settings.
- Added iOS metadata, safe-area support, favicon links, and mobile-friendly PWA settings.
- Added page loading overlays for menu navigation.

### Changed

- Added early theme and language initialization to prevent light-theme and Indonesian-language flashes during reloads.
- Updated the service worker to use fresh HTML navigation with cached static assets for faster repeat loads.
- Added offline navigation fallback and cache versioning.
- Kept all application files organized under `assets/`, `css/`, `js/`, and `pages/`.

### Fixed

- Fixed stale HTML being served by the service worker after updates.
- Fixed currency formatting on saved-list totals and monthly history.
- Fixed discount calculations in totals and average estimates.
- Prevented actual prices from receiving a second discount.
- Added validation and normalization for malformed localStorage and backup data.
- Prevented invalid language or currency settings from breaking the application.
- Stopped camera streams when barcode scanner initialization fails.
- Added offline fallback for uncached page navigation.
- Fixed saved-list action buttons overflowing on narrow mobile screens.
- Fixed Analytics sidebar icons overlapping their labels.
- Fixed missing Analytics navigation translations.
- Added explicit favicon usage to avoid browser favicon 404 requests.

## 1.2.0 - 2026-09-06

### Added

- Added PWA support with a web app manifest and service worker.
- Added Android and iPhone compatibility metadata.
- Added barcode scanning with manual barcode fallback and Open Food Facts lookup.
- Added backup and restore support.
- Added saved shopping lists and monthly purchase history.
- Added automatic localStorage persistence, dark mode, language switching, sharing, and text export.

### Changed

- Moved pages into `pages/`, scripts into `js/`, styles into `css/`, and icons into `assets/`.
- Updated all relative paths after the folder reorganization.
- Removed duplicate root-level files.

### Fixed

- Fixed PWA manifest paths after moving the manifest into `assets/`.
- Fixed service worker registration paths after moving the worker into `pages/`.
- Fixed quantity input so the default quantity of one appears as a placeholder instead of a value the user must delete.

## 1.0.0 - 2026-09-05

### Added

- Created the initial Belanja Pintar shopping-list application.
- Added shopping items, estimated and actual prices, quantities, categories, stores, budget tracking, search, sorting, progress tracking, and completed-item actions.
- Added saved lists, settings, localization, theme switching, and browser storage.
- Added the initial responsive interface for desktop and mobile browsers.
