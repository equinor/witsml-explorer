import { UserTheme } from "../../../contexts/operationStateReducer.tsx";
import { SxProps } from "@mui/material";
import { treeItemClasses } from "@mui/x-tree-view";

export const getStyles = (theme: UserTheme): SxProps => {
  if (theme === UserTheme.Compact)
    return {
      [`.${treeItemClasses.label} p`]: {
        p: "0.3rem 0.3rem 0.3rem 0rem"
      }
    };

  return {};
};
