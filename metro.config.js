// Expo's default Metro config, plus one surgical resolver workaround.
//
// `moti` renders through `framer-motion` on **web** (on native it uses
// Reanimated, so this path is web-only). framer-motion's ESM build does
// `import { __assign } from 'tslib'`. tslib's package-exports map routes the
// `import`/`node` condition to `./modules/index.js` — a shim that does
// `import tslib from '../tslib.js'; const { __extends } = tslib`. Under Metro's
// CJS→ESM interop that default is `undefined`, so web bundling crashes with
// "Cannot destructure property '__extends' of 'tslib.default'".
//
// Fix: resolve `tslib` with package-exports disabled *for tslib only*, so it
// falls back to its `main`/`module` field (`tslib.js` / `tslib.es6.js`), both
// of which export the helper functions directly. Everything else keeps package
// exports (Clerk et al. rely on it), and native is unaffected.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest ?? context.resolveRequest;
  if (moduleName === 'tslib') {
    return resolve({ ...context, unstable_enablePackageExports: false }, moduleName, platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
