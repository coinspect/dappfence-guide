---
title: How It Works
description: The three-layer architecture behind DappFence — client script, security Service Worker, and app Service Worker.
sidebar:
  order: 1
---

## The three layers

DappFence operates across three layers that work together:

1. **Client script (`dappfence.js`)** — a small inline script loaded as the first tag in `<head>`. It reads the configuration attributes, registers the Security Service Worker, and hands off control.
2. **Security Service Worker** — the main DappFence SW. It intercepts every fetch request, checks the response against the signed manifest, and blocks or passes through accordingly.
3. **App Service Worker** (optional) — if your app has its own SW, DappFence chains to it rather than replacing it.

---

## What happens on first load

On a first-time visit:

1. The browser parses and executes `dappfence.js` from `<head>`.
2. DappFence registers itself as a Service Worker at the root scope (`/`).
3. The SW fetches `integrity-manifest.json`, verifies the secp256k1 signature against the trusted Ethereum address, and caches the manifest.
4. The rest of the page loads normally — the SW is not yet intercepting requests on this first load.

The first page load is the one window of vulnerability.

---

## What happens on every subsequent request

Once the SW is installed and active, it intercepts every same-origin fetch:

1. The request arrives at the SW before hitting the network.
2. The SW looks up the requested path in the trusted manifest.
3. If the path is in the manifest: the SW fetches the response, hashes the body with SHA-256, and compares against the manifest entry.
4. If the hash matches: the response is returned to the page normally.
5. If the path is not in the manifest: the response passes through unverified (logged as `NOT_FOUND_IN_MANIFEST`).

---

## What happens when a file doesn't match

If a hash mismatch is detected:

1. The response is blocked — the page never receives the tampered file.
2. The block is recorded in IndexedDB with the file path and observed hash.
3. The browser is redirected to `/sw-api/security-warning`.
4. The block persists across page reloads and browser restarts until explicitly cleared.

To clear a block: click "Remove Site Lock" on the warning page, or call `POST /sw-api/site-unblock` with the API token.

---

## The blocking flow and the security warning page

The security warning page is served directly by the Service Worker — it does not require a network request and cannot be bypassed by an attacker who only controls CDN or DNS. The SW generates the page from its own code.

The warning includes:
- Which file triggered the block
- The expected hash (from the manifest) vs. the observed hash
- A button to remove the site lock (requires user action — not automatic)
