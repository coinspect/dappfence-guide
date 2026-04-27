---
title: GitHub Actions
description: Full example GitHub Actions workflow — build, sign, and deploy a static site with DappFence.
sidebar:
  order: 3
---

## Storing the private key

Add your signing key as a GitHub repository secret:

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `DAPPFENCE_SECRET_KEY`
4. Value: your 32-byte hex key

GitHub injects this as an environment variable during the workflow run.

---

## Full example workflow

```yaml
name: Build and deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build and sign
        env:
          DAPPFENCE_SECRET_KEY: ${{ secrets.DAPPFENCE_SECRET_KEY }}
        run: npm run build
        # postbuild runs automatically and signs the manifest

      - name: Deploy
        # Replace with your deploy step (e.g., actions/deploy-pages, Netlify CLI, etc.)
        run: echo "deploy dist/ to your hosting platform"
```

The `submodules: recursive` flag ensures the DappFence submodule is populated before the build runs. If DappFence is not a submodule in your repo, remove that option.

---

## Verifying the manifest was signed

Add a verification step after the build to catch failures early:

```yaml
- name: Verify manifest
  run: |
    if [ ! -f dist/integrity-manifest.json ]; then
      echo "ERROR: integrity-manifest.json not found in dist/"
      exit 1
    fi
    echo "Manifest present:"
    cat dist/integrity-manifest.json | node -e "
      const d = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
      console.log('Files hashed:', Object.keys(d.files || {}).length);
    "
```
