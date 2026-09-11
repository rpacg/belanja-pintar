# Belanja Pintar

A lightweight shopping planner app built as a static web app with local storage, saved lists, budget tracking, currency support, analytics, and offline-friendly behavior.

## Features

- Shopping list management with quantity, category, unit, notes, and discount
- Budget tracking and category budgets
- Saved lists and templates
- Currency conversion for IDR, USD, and SGD
- PDF export and simple analytics
- Offline-friendly PWA setup
- Mobile-friendly layout for browser use

## Run locally

Open the app directly in a browser, or serve the project locally:

```bash
cd c:/Projects/shopping
python -m http.server 8000
```

Then visit:

- http://localhost:8000/

## Deploy to GitHub Pages

This repository includes a GitHub Actions workflow for Pages deployment in [.github/workflows/pages.yml](.github/workflows/pages.yml).

1. Push this repo to GitHub.
2. Open the repository on GitHub.
3. Go to Settings > Pages.
4. Set Source to GitHub Actions.
5. The workflow will deploy the static site automatically on every push to `main`.

## Notes

- The app is designed as a static local-first project and stores data in browser localStorage.
- There is no backend or cloud sync yet.
- For a native app experience, the project can later be wrapped with Capacitor or similar tooling.
