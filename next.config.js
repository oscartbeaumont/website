// next.config.js
const path = require('path');
const copyFile = require('util').promisify(require('fs').copyFile);
const withPlugins = require('next-compose-plugins');

module.exports = withPlugins([
  [require('@zeit/next-mdx')(), {}],
  [require('next-optimized-images'), {}],
  /* [require('next-fonts'), {}], */
], {
  outDir: 'dist',
  pageExtensions: ['js', 'jsx', 'mdx'],

  exportPathMap: async function (defaultPathMap, {dev, dir, outDir, distDir, buildId}) {
    if (dev) return defaultPathMap
    await copyFile(path.join(dir, '_redirects'), path.join(outDir, '_redirects'));
    return defaultPathMap
  }
});
