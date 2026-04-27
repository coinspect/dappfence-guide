---
title: Getting Started
description: Step-by-step guide to adding DappFence to your project.
sidebar:
  order: 2
---

Step-by-step guide to adding DappFence to your project.

---

## Prerequisites

- Node.js 16+
- A project with a static build step (HTML, JS, CSS output)
- Ability to modify your HTML entry point

---

## Step 1: Get dappfence.js

**Option A: Git submodule (recommended)**

Tracks which version of DappFence your project uses and keeps everything in one repo.

```bash
git submodule add https://github.com/coinspect/dappfence.git dappfence
cd dappfence && npm install && npm run build:prod && cd ..
```

When teammates or CI clone your repo, they run `git submodule update --init --recursive` to populate it.

**Option B: Clone separately**

```bash
git clone https://github.com/coinspect/dappfence.git
cd dappfence && npm install && npm run build:prod && cd ..
```

---

Either way, copy the built file to your project's public root:

```bash
cp dappfence/packages/dappfence/dist/dappfence.js public/dappfence.js
```

`dappfence.js` must be served from the domain root (`/dappfence.js`).

---

## Step 2: Generate a signing key

Run this from inside the `dappfence` directory:

```bash
node -e "
const { getPublicKey, hexToBytes, ethereumAddress } = require('./packages/signer/src/crypto');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
const publicKey = getPublicKey(hexToBytes(secretKey));
const address = ethereumAddress(publicKey);
console.log('SECRET KEY:      ', secretKey);
console.log('ETHEREUM ADDRESS:', address);
"
```

- **SECRET KEY** — store this somewhere safe (password manager, CI/CD secret). Never commit it.
- **ETHEREUM ADDRESS** — goes in your HTML script tag in the next step.

---

## Step 3: Add the script tag to your HTML

Add `dappfence.js` as the **very first script** in `<head>`, before anything else:

```html
<head>
  <script
    src="/dappfence.js"
    data-manifest="/integrity-manifest.json"
    data-manifest-signature-type="noble-secp256k1-recovered-eth"
    data-manifest-signature-identity="0xYOUR_ETHEREUM_ADDRESS"
  ></script>
  <!-- rest of your head -->
</head>
```

> **Important:** `data-manifest-signature-identity` must exactly match the Ethereum address derived from your secret key. A mismatch causes DappFence to reject the manifest entirely.

---

## Step 4: Install the signer

From your project root:

```bash
# If dappfence is a submodule at dappfence/ in your project root:
npm install dappfence/packages/signer

# If you cloned it next to your project:
npm install /path/to/dappfence/packages/signer
```

This adds `@dappfence/signer` as a `file:` dependency in your `package.json`.

---

## Step 5: Write the sign script

Create `scripts/sign-manifest.js`.

### CommonJS

```js
const { calculateFileHash, signManifest } = require('@dappfence/signer');
const { hexToBytes, getPublicKey } = require('@dappfence/signer/crypto');
const fs = require('fs');
const path = require('path');

// Adjust to your framework's output directory:
//   Vite / Astro / Remix  →  dist
//   Next.js (static)      →  out
//   Create React App      →  build
const BUILD_DIR = path.resolve(__dirname, '../dist');

const SECRET_KEY = process.env.DAPPFENCE_SECRET_KEY;
if (!SECRET_KEY) throw new Error('DAPPFENCE_SECRET_KEY is required');

const secretKey = hexToBytes(SECRET_KEY);
const publicKey = getPublicKey(secretKey);
const extensions = ['.js', '.css', '.html', '.json', '.svg'];
const MANIFEST_FILENAME = 'integrity-manifest.json';

function walkDir(dir, base = dir) {
  return fs.readdirSync(dir).flatMap(entry => {
    const full = path.join(dir, entry);
    return fs.statSync(full).isDirectory()
      ? walkDir(full, base)
      : [path.relative(base, full).replace(/\\/g, '/')];
  });
}

const files = walkDir(BUILD_DIR)
  .filter(f => extensions.some(ext => f.endsWith(ext)) && f !== MANIFEST_FILENAME);

const manifestFiles = {};
for (const file of files) {
  manifestFiles[`/${file}`] = calculateFileHash(path.join(BUILD_DIR, file));
}

const signed = signManifest({ files: manifestFiles }, { publicKey, secretKey });
fs.writeFileSync(path.join(BUILD_DIR, MANIFEST_FILENAME), JSON.stringify(signed, null, 2));
console.log(`Manifest signed. ${files.length} files hashed.`);
```

### ES modules

If your `package.json` contains `"type": "module"`:

```js
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import signer from '@dappfence/signer';
import signerCrypto from '@dappfence/signer/crypto';

const { calculateFileHash, signManifest } = signer;
const { hexToBytes, getPublicKey } = signerCrypto;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Adjust to your framework's output directory:
//   Vite / Astro / Remix  →  dist
//   Next.js (static)      →  out
//   Create React App      →  build
const BUILD_DIR = path.resolve(__dirname, '../dist');

const SECRET_KEY = process.env.DAPPFENCE_SECRET_KEY;
if (!SECRET_KEY) throw new Error('DAPPFENCE_SECRET_KEY is required');

const secretKey = hexToBytes(SECRET_KEY);
const publicKey = getPublicKey(secretKey);
const extensions = ['.js', '.css', '.html', '.json', '.svg'];
const MANIFEST_FILENAME = 'integrity-manifest.json';

function walkDir(dir, base = dir) {
  return fs.readdirSync(dir).flatMap(entry => {
    const full = path.join(dir, entry);
    return fs.statSync(full).isDirectory()
      ? walkDir(full, base)
      : [path.relative(base, full).replace(/\\/g, '/')];
  });
}

const files = walkDir(BUILD_DIR)
  .filter(f => extensions.some(ext => f.endsWith(ext)) && f !== MANIFEST_FILENAME);

const manifestFiles = {};
for (const file of files) {
  manifestFiles[`/${file}`] = calculateFileHash(path.join(BUILD_DIR, file));
}

const signed = signManifest({ files: manifestFiles }, { publicKey, secretKey });
fs.writeFileSync(path.join(BUILD_DIR, MANIFEST_FILENAME), JSON.stringify(signed, null, 2));
console.log(`Manifest signed. ${files.length} files hashed.`);
```

---

## Step 6: Wire it into your build

Add a `postbuild` script to your `package.json`. Node.js runs it automatically after `build`:

```json
{
  "scripts": {
    "build": "your-build-command",
    "postbuild": "node scripts/sign-manifest.js"
  }
}
```

---

## Step 7: Deploy

Set `DAPPFENCE_SECRET_KEY` as a secret environment variable in your CI/CD platform — it will be injected automatically during the build.

```bash
# Local testing
export DAPPFENCE_SECRET_KEY=your-secret-key
npm run build
```

For platform-specific setup, see [GitHub Actions](/integration/github-actions/), [Vercel](/integration/vercel/), and [Netlify](/integration/netlify/).

---

## Step 8: Verify

Visit `https://yoursite.com/sw-api/status`. You should see:

```json
{
  "appVersion": "manifest-...",
  "stats": {
    "trustedFiles": 42,
    "activeBlocks": 0
  }
}
```

`trustedFiles` should match the file count logged by the sign script. `activeBlocks: 0` means nothing is blocked.

You can also open DevTools → Application → Service Workers and confirm `dappfence.js` is registered.

---

## Step 9: Simulate a breach (optional)

To see DappFence block a tampered file:

1. After building, open any `.js` file in your output directory
2. Add a comment at the top: `// tampered`
3. Do NOT re-run the signer (the manifest still has the old hash)
4. Serve the site and load it in the browser

DappFence will detect the hash mismatch and redirect to the security warning page. The block persists across reloads (stored in IndexedDB) until explicitly cleared.

To unblock via the UI, click "Remove Site Lock" on the warning page.

To unblock programmatically, get the API token from the security warning page's HTML and pass it as a header:

```js
const token = document.querySelector('meta[name="dappfence-token"]').content;
fetch('/sw-api/site-unblock', {
  method: 'POST',
  headers: { 'X-DappFence-Token': token }
});
```

---

## Troubleshooting

**`require is not defined in ES module scope`**
- Your project uses `"type": "module"`. Use the ESM version of the sign script from Step 5.

**Old blocks persist after a rebuild**
- Blocks are stored in IndexedDB and survive page reloads and rebuilds.
- Click "Remove Site Lock" on the warning page to clear all active blocks after a fix.

**`data-manifest-signature-identity` mismatch**
- The Ethereum address in your script tag must exactly match the one derived from your secret key.
- If you regenerate a key pair, update both the tag and your CI/CD secret.

**Service worker not registering**
- `dappfence.js` must be served from the domain root (`/dappfence.js`), not a subdirectory.
- Service workers require HTTPS in production. `localhost` is fine for local testing.

**Files showing as `NOT_FOUND_IN_MANIFEST`**
- Check that paths in the manifest match the URLs the browser requests (leading slash, no trailing slash).
- Check `/sw-api/status` to compare manifest keys against what's being requested.
