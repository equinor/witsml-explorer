/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require("webpack");
const weURL = process.env.NEXT_PUBLIC_WITSMLEXPLORER_FRONTEND_URL;
const wePath = weURL && weURL.length > 0 ? new URL(weURL).pathname : "";

module.exports = {
  distDir: "build",
  basePath: wePath,
  webpack: (config) => {
    const env = Object.keys(process.env).reduce((acc, curr) => {
      acc[`process.env.NODE_ENV${curr}`] = JSON.stringify(process.env[curr]);
      return acc;
    }, {});

    config.plugins.push(new webpack.DefinePlugin(env));
    return config;
  }
};
