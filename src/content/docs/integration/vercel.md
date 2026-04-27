---
title: Vercel
description: Deploy a DappFence-protected site on Vercel using the postbuild hook and environment variables.
sidebar:
  order: 4
---

## Storing the private key

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add `DAPPFENCE_SECRET_KEY` with your 32-byte hex key
3. Set the environment to **Production** (and Preview if you want signing there too)

Vercel injects this variable during the build — the `postbuild` script picks it up automatically.

---

## Build configuration

Vercel uses your `package.json` scripts. The `postbuild` hook fires automatically:

```json
{
  "scripts": {
    "build": "your-build-command",
    "postbuild": "node scripts/sign-manifest.js"
  }
}
```

No changes to `vercel.json` are needed for the signing step. Vercel's build output directory (`dist/` or whatever your framework uses) is where the signer writes the manifest.

---

## Submodules

If DappFence is a git submodule in your project, Vercel does **not** clone submodules by default. Enable it:

1. Go to **Settings → Git**
2. Enable **"Clone submodules"**

Without this, the signer package won't be available and the build will fail.

---

## Full example: vercel.json

For most projects no `vercel.json` is needed. If you need one:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci"
}
```

The `postbuild` in `package.json` handles signing — no separate `buildCommand` override is needed.

---

## Verifying the deployment

After deploying, visit `https://yoursite.vercel.app/sw-api/status`. The response should show `stats.trustedFiles > 0` and `stats.activeBlocks: 0`.
