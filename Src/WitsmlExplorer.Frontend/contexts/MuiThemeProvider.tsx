import { ThemeProvider } from "@mui/material";
import { useOperationState } from "hooks/useOperationState";
import { ReactElement, ReactNode } from "react";
import { getTheme } from "styles/material-eds";

interface MuiThemeProviderProps {
  children: ReactNode;
}

export const MuiThemeProvider = ({
  children
}: MuiThemeProviderProps): ReactElement => {
  const {
    operationState: { theme }
  } = useOperationState();

  return <ThemeProvider theme={getTheme(theme)}>{children}</ThemeProvider>;
};
