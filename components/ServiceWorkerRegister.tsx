"use client";

import { useEffect } from "react";

// Registers the image-caching service worker (public/sw.js). Fire-and-forget:
// if registration fails (unsupported browser, blocked, etc.) the site just
// runs without the offline image cache.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
