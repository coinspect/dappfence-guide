---
title: Build Pipeline
description: How to wire the DappFence signer into any build pipeline — the concepts, the key as a CI secret, and what must be deployed together.
sidebar:
  order: 1
---

## How the signer fits into any build pipeline

The DappFence signer is a Node.js script that runs **after** your build tool finishes writing files to the output directory. It reads every file matching your configured extensions, hashes them, and writes a signed `integrity-manifest.json` into the same output directory.

The pattern is the same regardless of framework or build tool:

```
build tool → output dir → signer → output dir + manifest → deploy
```

The idiomatic hook is a `postbuild` npm script — Node.js runs it automatically after `build` completes:

```json
{
  "scripts": {
    "build": "your-build-command",
    "postbuild": "node scripts/sign-manifest.js"
  }
}
```

If your build tool is not npm-based (Make, shell scripts, custom CI steps), run the signer explicitly after your build step and before deploying.

---

## The private key as a CI/CD secret

The signing key **must never be committed to the repository**. Store it as a secret environment variable in your CI/CD platform and pass it to the build:

```bash
export DAPPFENCE_SECRET_KEY=your-32-byte-hex-key
npm run build
```

Your sign script reads it from the environment:

```js
const SECRET_KEY = process.env.DAPPFENCE_SECRET_KEY;
if (!SECRET_KEY) throw new Error('DAPPFENCE_SECRET_KEY is required');
```

If the variable is missing, the build should fail loudly — not silently produce an unsigned or empty manifest.

---

## The three things that must be deployed together

Every deployment must include all three:

1. **Your app** (HTML, JS, CSS, and other static assets)
2. **`dappfence.js`** — the Service Worker bundle, served at `/dappfence.js`
3. **`integrity-manifest.json`** — the signed manifest, served at `/integrity-manifest.json`

If the manifest is missing or stale (from a previous build), DappFence will block files whose hashes no longer match. If `dappfence.js` is missing, the SW cannot register. Both must be at the domain root.

---

## Platform-specific guides

- [GitHub Actions](/integration/github-actions/)
- [Vercel](/integration/vercel/)
- [Netlify](/integration/netlify/)
