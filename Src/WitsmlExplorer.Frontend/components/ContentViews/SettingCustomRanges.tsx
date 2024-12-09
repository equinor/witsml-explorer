import {
  EdsProvider,
  Icon,
  Menu,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import { Checkbox } from "@mui/material";
import { Column, Table } from "@tanstack/react-table";
import {
  activeId,
  calculateColumnWidth,
  expanderId,
  selectId
} from "components/ContentViews/table/contentTableUtils";
import {
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table/tableParts";
import { Button } from "components/StyledComponents/Button";
import { UserTheme } from "contexts/operationStateReducer";
import { useLocalStorageState } from "hooks/useLocalStorageState";
import { useOperationState } from "hooks/useOperationState";
import { debounce } from "lodash";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { checkIsUrlTooLong } from "routes/utils/checkIsUrlTooLong";
import styled from "styled-components";
import { Colors } from "styles/Colors";


type FilterValues = Record<string, string>;

export const SettingCustomRanges = (props: {
  table: Table<any>;
}): React.ReactElement => {
 
  const {
    operationState: { colors, theme }
  } = useOperationState();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);


  return (
    <>
      <Button variant={"ghost"}>
        <Icon name="person" />
      </Button>
     
      <StyledMenu
        open={isMenuOpen}
        id="menu-default"
        aria-labelledby="anchor-default"
        onClose={() => setIsMenuOpen(false)}
        anchorEl={menuAnchor}
        placement="left-end"
        colors={colors}
      >
        <Typography style={{ paddingBottom: "16px" }}></Typography>
        <div style={{ display: "flex" }}>
          <Checkbox
            
            
          />
          <Typography
            style={{
              fontFamily: "EquinorMedium",
              fontSize: "0.875rem",
              padding: "0.25rem 0 0 0.25rem"
            }}
          >
            Toggle all over
          </Typography>
        </div>
        {/* set onDragOver and onDrop on an outer div so that the mouse cursor properly detect a drop area, has an annoying flicker tho */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
          }}
          style={{ padding: "0.125rem 0 0.25rem 0" }}
        ></div>
      </StyledMenu>
    </>
  );
};

const StyledMenu = styled(Menu)<{ colors: Colors }>`
  background: ${(props) => props.colors.ui.backgroundLight};
  p {
    color: ${(props) => props.colors.text.staticIconsDefault};
  }
  padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  max-height: 90vh;
  overflow-y: scroll;

  div[class*="InputWrapper__Container"] {
    label.dHhldd {
      color: ${(props) => props.colors.text.staticTextLabel};
    }
  }

  div[class*="Input__Container"][disabled] {
    background: ${(props) => props.colors.text.staticTextFieldDefault};
    border-bottom: 1px solid #9ca6ac;
  }

  div[class*="Input__Container"] {
    background-color: ${(props) => props.colors.text.staticTextFieldDefault};
  }

  input[class*="Input__StyledInput"] {
    padding: 4px;
  }
`;

export const createColumnFilterSearchParams = (
  currentSearchParams: URLSearchParams,
  filterValues: FilterValues
): URLSearchParams => {
  if (Object.entries(filterValues).length === 0) {
    currentSearchParams.delete("filter");
  } else {
    currentSearchParams.set("filter", JSON.stringify(filterValues));
  }
  return currentSearchParams;
};
