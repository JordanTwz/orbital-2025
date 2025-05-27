// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1) Allow Metro to resolve .cjs modules
config.resolver.sourceExts.push('cjs');

// 2) Turn off the new package‐exports enforcement so Firebase's internals load correctly
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
