// The benchmark compares against other SHA-256 implementations. Several
// of them ship no type declarations, and the rest are reached through
// deep subpaths that their `exports` maps do not describe. They are only
// ever poked at through the small Adapter surface in adapters.ts, so
// declaring them as untyped modules keeps the comparison honest without
// inventing signatures for libraries this package does not own.

declare module "create-hash/browser.js"
declare module "crypto-js"
declare module "hash.js/lib/hash/sha/256.js"
declare module "jssha/dist/sha256"
declare module "node-forge/lib/sha256.js"
declare module "sha.js/sha256.js"
