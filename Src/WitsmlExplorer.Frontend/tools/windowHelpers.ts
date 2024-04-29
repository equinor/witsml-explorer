import { isDesktopApp } from "tools/desktopAppHelpers";

export const openRouteInNewWindow = (route: string) => {
  if (isDesktopApp()) {
    // @ts-ignore
    window.electronAPI.newWindow(route);
  } else {
    const host = `${window.location.protocol}//${window.location.host}`;
    window.open(`${host}${route}`);
  }
};
