---
title: Why DappFence
description: DappFence is a browser-side integrity protection layer for web frontends. Learn what it does, who it's for, and what it doesn't cover.
---

DappFence is a browser-side integrity protection layer for web frontends. It uses a Service
Worker to intercept your origin's files and verify them against a cryptographically signed
manifest. If a same-origin file has been tampered with — by a post-deployment file swap, a
compromised build pipeline, or a DNS hijack — the Service Worker blocks it and redirects to
a security warning page.

---

## Real attacks

Modern web applications rely on infrastructure beyond your direct control — CDNs and
deployment platforms. Each introduces a potential attack vector.

**Real incidents:**

- **Safe{Wallet} / Bybit (Feb 2025)** — Attackers compromised a Safe developer's machine,
  stole AWS credentials, and used them to replace a static JS file directly in S3. The
  tampered file was served from Safe's own domain for two days. Bybit's signers approved
  what looked like a routine transfer — the malicious JS swapped the transaction payload
  in the background. $1.5B was drained. DappFence would have caught the hash mismatch on
  that file for any returning user.

- **Squarespace DNS hijack (Jul 2024)** — Dozens of DeFi frontends had their DNS records
  hijacked via a compromised registrar. Attackers served modified frontends from a
  different server. Returning users with DappFence installed would have seen a hash
  mismatch on the tampered files and been blocked before any malicious code ran.

In both cases the attack happened in the delivery layer, after the legitimate code left
the developer's hands — exactly where DappFence defends.

---

## How it works (one paragraph)

Before deploying, you run a signer that hashes every static file in your build output and
produces a signed manifest (`integrity-manifest.json`). The manifest is signed with a
secp256k1 key — the corresponding Ethereum address is embedded in your HTML. When a user
loads your site, DappFence's script tag installs a Service Worker. From that point on,
every file request is intercepted: the SW fetches the manifest, verifies the signature,
then checks each file's hash before returning it to the page. A hash mismatch means the
file was tampered with — the request is blocked and the user sees a security warning.

---

## Who this is for

DappFence is designed for high-stakes web applications where a compromised frontend means
real financial or security harm:

- **Crypto wallets and dapps** — the original target; a tampered frontend can drain funds
- **Financial platforms** — any app where account compromise means money lost
- **Admin dashboards** — internal tools where a tampered UI could exfiltrate credentials
- **Any app where you need to prove to users that what they're running is what you deployed**

---

## Out of scope

- **Backend APIs** — DappFence only covers the browser-side, not server responses
- **Native apps** — mobile or desktop apps are out of scope
- **SSR-generated HTML** — pages rendered dynamically per request cannot be pre-hashed;
  only static output is supported
- **First page load (first visit only)** — the Service Worker cannot be active before the
  initial HTML is parsed; returning visitors are fully protected

---

## Browser support

DappFence relies on the Service Worker API, which is supported in all modern browsers:
Chrome, Firefox, Safari (15.4+), Edge. It requires HTTPS in production (`localhost` works
for local development).

Internet Explorer and old Safari are not supported.

---

## Next steps

- [Getting Started](/getting-started/getting-started/) — get DappFence running in 20 minutes
- [How it works](/core-concepts/how-it-works/) — deeper dive into the architecture
