---
title: The Manifest
description: What the integrity manifest is, which files get hashed, how it's signed, and why it must be re-signed on every build.
sidebar:
  order: 2
---

## What the manifest is

`integrity-manifest.json` is a signed JSON file that maps every static asset path to its SHA-256 hash. It is generated at build time by the DappFence signer and deployed alongside your app.

When a user loads your site, the Service Worker fetches this manifest, verifies its cryptographic signature, and uses it as the source of truth for every subsequent file request.

---

## Which files get hashed by default

The signer hashes files matching these extensions by default:

- `.js`
- `.css`
- `.html`
- `.json`
- `.svg`

`integrity-manifest.json` itself is always excluded — it cannot hash itself (it doesn't exist yet when the script runs), and its integrity is guaranteed by its own signature.

---

## How to customize the file extensions

Pass a custom extensions list in your sign script:

```js
const extensions = ['.js', '.css', '.html', '.svg', '.wasm'];
```

Exclude specific files with a filter:

```js
const files = walkDir(BUILD_DIR)
  .filter(f => extensions.some(ext => f.endsWith(ext)) && f !== MANIFEST_FILENAME);
```

---

## The signing process

DappFence uses **secp256k1** — the same elliptic curve used by Ethereum. The signer:

1. Computes a SHA-256 hash for each file.
2. Builds a payload object: `{ files: { "/path": "sha256-hash", ... } }`.
3. Signs the JSON serialization of the payload with the private key using `noble-secp256k1`.
4. Wraps the result in `{ pay: <payload>, sig: <signature>, identity: <ethereum-address>, signatureType: "noble-secp256k1-recovered-eth" }` and writes it as `integrity-manifest.json`.

The trusted Ethereum address is also embedded in the `data-manifest-signature-identity` attribute of the DappFence script tag. At runtime, the SW verifies that the manifest was signed by the key corresponding to that address — if not, the manifest is rejected entirely.

---

## Why re-signing is required on every build

The manifest is a snapshot of your build output at a specific point in time. Any change to any hashed file produces a different hash — the old manifest no longer matches.

This is intentional: if a file changes without a new signed manifest, DappFence will block it. This is exactly the protection you want. The signing step must be part of every production build.

---

