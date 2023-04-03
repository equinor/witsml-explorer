/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const weURL = process.env.NEXT_PUBLIC_WITSMLEXPLORER_FRONTEND_URL;
const wePath = weURL && weURL.length > 0 ? new URL(weURL).pathname : "";

module.exports = {
  distDir: "build",
  basePath: wePath
};
