import React, { FC, ReactNode } from "react";
import { useOperationState } from "../../hooks/useOperationState.tsx";
import { EdsProvider as NativeEdsProvider } from "@equinor/eds-core-react";
import { normaliseThemeForEds } from "../../tools/themeHelpers.ts";
import { UserTheme } from "../operationStateReducer.tsx";

const CompactEdsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    operationState: { theme }
  } = useOperationState();

  if (theme === UserTheme.Compact)
    return (
      <NativeEdsProvider density={normaliseThemeForEds(theme)}>
        {children}
      </NativeEdsProvider>
    );

  return children;
};

export default CompactEdsProvider;
