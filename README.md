# Laptop SSH & LAN Monitor Website

This repository hosts the static dashboard for monitoring the SSH availability and local network status of the laptop.

## Deploying to GitHub Pages

1. Go to the repository settings on GitHub.
2. Navigate to **Pages** in the sidebar.
3. Under **Build and deployment**, select **Deploy from a branch** as the source.
4. Select the `main` branch and the root `/` folder, then click **Save**.
5. The dashboard will be available at `https://<username>.github.io/ssh_monitor/`.

## Architecture & Behavior

* **Static Hosting**: The page runs completely client-side in the browser. No backend server is required.
* **Auto-Refresh**: The page queries `status.json` every 60 seconds.
* **Cache Busting**: Every fetch request appends a unique query parameter (`status.json?t=<timestamp>`) to bypass CDN/browser caches.
* **Staleness Tracking**: If the time difference between the current browser time and the `last_update` timestamp exceeds:
  * **30 minutes**: Displays a warning banner indicating the report is slightly stale.
  * **60 minutes**: Marks the laptop status as **STALE** (orange/red indicator) and displays a critical warning indicating the laptop may be offline or shut down.
* **Timezone support**: Timestamps are parsed and rendered in **Indian Standard Time (IST, UTC+05:30)** regardless of the viewer's local system timezone.
