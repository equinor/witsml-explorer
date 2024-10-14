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
import { useOperationState } from "../../../../../../hooks/useOperationState.tsx";
import styled from "styled-components";
import { Menu } from "@equinor/eds-core-react";
import { Colors } from "../../../../../../styles/Colors.tsx";

type TemplatePickerProps = {
  dispatchQuery: DispatchQuery;
  returnElements: ReturnElements;
};

const TemplatePicker: FC<TemplatePickerProps> = ({
  dispatchQuery,
  returnElements
}) => {
  const {
    operationState: { colors }
  } = useOperationState();

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
        colors={colors}
      >
        {Object.values(TemplateObjects).map((value) => {
          return (
            <StyledMenuItem
              colors={colors}
              key={value}
              onClick={() => onTemplateSelect(value)}
            >
              {value}
            </StyledMenuItem>
          );
        })}
      </StyledMenu>
    </>
  );
};

export default TemplatePicker;

const StyledMenu = styled(Menu)<{ colors: Colors }>`
  background: ${(props) => props.colors.ui.backgroundLight};
  max-height: 80vh;
  overflow-y: scroll;
`;

const StyledMenuItem = styled(Menu.Item)<{ colors: Colors }>`
  &&:hover {
    background-color: ${(props) =>
      props.colors.interactive.contextMenuItemHover};
  }

  color: ${(props) => props.colors.text.staticIconsDefault};
  padding: 4px;
`;
