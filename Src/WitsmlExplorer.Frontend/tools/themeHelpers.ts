import { UserTheme } from "../contexts/operationStateReducer.tsx";

export const normaliseThemeForEds = (
  theme: UserTheme
): UserTheme.Compact | UserTheme.Comfortable => {
  if (theme === UserTheme.Comfortable) return UserTheme.Comfortable;
  return UserTheme.Compact;
};

export const isInAnyCompactMode = (theme: UserTheme): boolean =>
  theme !== UserTheme.Comfortable;
