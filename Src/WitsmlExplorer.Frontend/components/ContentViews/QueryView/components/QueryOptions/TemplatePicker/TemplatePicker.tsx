import React, { FC, useState } from "react";
import { Button } from "../../../../../StyledComponents/Button.tsx";
import Icon from "../../../../../../styles/Icons.tsx";
import {
  getQueryTemplate,
  ReturnElements,
  TemplateObjects
} from "../../../../QueryViewUtils.tsx";
import {
  DispatchQuery,
  QueryActionType
} from "../../../../../../contexts/queryContext.tsx";
import StyledMenu from "../../../../../StyledComponents/StyledMenu";
import { MenuItem } from "@mui/material";
import { useOperationState } from "../../../../../../hooks/useOperationState.tsx";

type TemplatePickerProps = {
  dispatchQuery: DispatchQuery;
  returnElements: ReturnElements;
};

const TemplatePicker: FC<TemplatePickerProps> = ({
  dispatchQuery,
  returnElements
}) => {
  const { interactive, text } = useOperationState().operationState.colors;

  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);

  const onTemplateSelect = (templateObject: TemplateObjects) => {
    const template = getQueryTemplate(templateObject, returnElements);
    if (template != undefined) {
      dispatchQuery({ type: QueryActionType.SetQuery, query: template });
    }
    setIsTemplateMenuOpen(false);
  };

  return (
    <>
      <Button
        ref={setMenuAnchor}
        id="anchor-default"
        aria-haspopup="true"
        aria-expanded={isTemplateMenuOpen}
        aria-controls="menu-default"
        color="secondary"
        onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
        style={{ whiteSpace: "nowrap" }}
      >
        <Icon name="style" />
        Pick template
      </Button>
      <StyledMenu
        open={isTemplateMenuOpen}
        id="menu-default"
        aria-labelledby="anchor-default"
        onClose={() => setIsTemplateMenuOpen(false)}
        anchorEl={menuAnchor}
        slotProps={{
          paper: {
            sx: {
              maxHeight: "80vh",
              overflowY: "scroll"
            }
          }
        }}
      >
        {Object.values(TemplateObjects).map((value) => (
          <MenuItem
            key={value}
            onClick={() => onTemplateSelect(value)}
            sx={{
              "&:hover": {
                backgroundColor: interactive.contextMenuItemHover
              },
              "color": text.staticIconsDefault
            }}
          >
            {value}
          </MenuItem>
        ))}
      </StyledMenu>
    </>
  );
};

export default TemplatePicker;
