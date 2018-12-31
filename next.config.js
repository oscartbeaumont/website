// next.config.js
const withMDX = require('@zeit/next-mdx')();

const fs = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const copyFile = promisify(fs.copyFile);



module.exports = withMDX({
  outDir: 'dist',
  pageExtensions: ['js', 'jsx', 'mdx'],

  exportPathMap: async function (defaultPathMap, {dev, dir, outDir, distDir, buildId}) {
    if (dev) return defaultPathMap
    await copyFile(join(dir, '_redirects'), join(outDir, '_redirects'));
    return defaultPathMap
  }
});
