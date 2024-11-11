export const isDesktopApp = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf(" electron/") > -1;
};
