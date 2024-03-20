/* eslint-disable no-undef */

module.exports = {
  distDir: "build",
  webpack: (config) => {
    config.module.rules.push({
      test: /\.xml$/i,
      use: "raw-loader"
    });
    return config;
  },
  async rewrites() {
    return [
      // Rewrite everything else to use `pages/index`
      {
        source: "/:path*",
        destination: "/"
      }
    ];
  }
};
