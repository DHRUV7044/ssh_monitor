# Laptop SSH & LAN Monitor Website

A client-side static dashboard hosted on GitHub Pages that provides real-time monitoring of a remote Ubuntu laptop's local network status and SSH service state. 

## Features
- **Real-Time Visualization**: Displays laptop connection status (Online, Offline, or Stale) with distinct, colored status indicators.
- **Client-Side Operation**: Runs entirely in the browser, fetching status information from a statically hosted JSON file (`status.json`).
- **Cache-Busting Queries**: Appends unique query parameter timestamps (`status.json?t=<timestamp>`) on fetch calls to bypass browser and CDN caches.
- **Automatic Refreshing**: Polls `status.json` every 60 seconds to ensure the dashboard stays up to date.
- **Staleness Threshold Alerts**:
  - Displays a warning banner if status reports are older than 30 minutes.
  - Marks laptop status as **STALE** (and shows a critical alert) if the last update timestamp is older than 60 minutes.
- **Indian Standard Time (IST) Support**: Parses and renders all updates in Indian Standard Time (IST, UTC+05:30) for consistency, regardless of the viewer's local browser timezone.

## How it Works
The frontend queries a `status.json` file which is updated periodically by a background monitor daemon running on the laptop.

## Deployment to GitHub Pages
1. Go to the repository settings on GitHub.
2. Select **Pages** in the sidebar.
3. Under **Build and deployment**, set **Deploy from a branch** as the source.
4. Select the `main` branch and `/` (root) folder, then click **Save**.\n