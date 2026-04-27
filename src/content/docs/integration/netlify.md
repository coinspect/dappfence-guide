---
title: Netlify
description: Deploy a DappFence-protected site on Netlify using the postbuild hook and environment variables.
sidebar:
  order: 5
---

## Storing the private key

1. Go to **Site Settings → Environment Variables**
2. Click **Add a variable**
3. Key: `DAPPFENCE_SECRET_KEY`, Value: your 32-byte hex key

Netlify injects this into the build environment — the `postbuild` script picks it up automatically.

---

## Build configuration

The `postbuild` hook in `package.json` fires after your main build command:

```json
{
  "scripts": {
    "build": "your-build-command",
    "postbuild": "node scripts/sign-manifest.js"
  }
}
```

In `netlify.toml`, set your build command and publish directory:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Netlify runs `npm run build`, which triggers `postbuild` automatically. The manifest ends up in `dist/` and gets published alongside your app.

---

## Submodules

Netlify supports git submodules. Enable it:

1. Go to **Site Settings → Build & Deploy → Build settings**
2. Enable **"Use submodules"**

This ensures the DappFence submodule is initialized before the build runs. Without it, the signer package won't be available.

---

## Verifying the deployment

After deploying, visit `https://yoursite.netlify.app/sw-api/status`. The response should show `stats.trustedFiles > 0` and `stats.activeBlocks: 0`.
