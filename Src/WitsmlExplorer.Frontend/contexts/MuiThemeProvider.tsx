import { ThemeProvider } from "@mui/material";
import OperationContext from "contexts/operationContext";
import { ReactElement, ReactNode, useContext } from "react";
import { getTheme } from "styles/material-eds";

interface MuiThemeProviderProps {
  children: ReactNode;
}

export const MuiThemeProvider = ({
  children
}: MuiThemeProviderProps): ReactElement => {
  const {
    operationState: { theme }
  } = useContext(OperationContext);

  return <ThemeProvider theme={getTheme(theme)}>{children}</ThemeProvider>;
};
