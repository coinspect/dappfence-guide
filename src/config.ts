export const GITHUB_URL = 'https://github.com/coinspect/dappfence';

export const SITE_TITLE = 'DappFence — Cryptographic Frontend Integrity';
export const SITE_DESCRIPTION = 'A Service Worker that intercepts every request your app makes and checks it against a cryptographically signed manifest. One script tag. No server changes. No trusted CDN required.';

export const HOW_IT_WORKS = [
  {
    number: '01',
    heading: 'Sign at build time.',
    body: 'Your CI pipeline hashes every JS, CSS, and HTML file with SHA-256 and signs the manifest using a secp256k1 key. The trusted signer identity — an Ethereum address derived from your key — is embedded in the script tag.',
  },
  {
    number: '02',
    heading: 'Verify at runtime.',
    body: 'DappFence registers as a Service Worker on first load. Every subsequent request is intercepted: the response is hashed and checked against the signed manifest before the browser executes it.',
  },
  {
    number: '03',
    heading: 'Block on mismatch.',
    body: "Any file whose hash doesn't match is blocked and the user is redirected to a security warning page. The block persists across reloads — stored in IndexedDB — until explicitly cleared.",
  },
];
