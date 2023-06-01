import { Typography } from "@equinor/eds-core-react";
import React from "react";
import styled from "styled-components";

export interface PanelProps {
  showTotalItems: boolean;
  showCheckedItems: boolean;
  panelElements?: React.ReactElement[];
  numberOfCheckedItems?: number;
  numberOfItems?: number;
}

const Panel = (props: PanelProps) => {
  const { showTotalItems, showCheckedItems, panelElements, numberOfCheckedItems, numberOfItems } = props;

  if (!showTotalItems && !panelElements) return null;

  const selectedItemsText = showCheckedItems ? `Selected: ${numberOfCheckedItems}/${numberOfItems}` : `Items: ${numberOfItems}`;

  const selectedItemsElement = showTotalItems ? <Typography>{selectedItemsText}</Typography> : null;

  return (
    <Div>
      {selectedItemsElement}
      {panelElements}
    </Div>
  );
};

const Div = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 4px;
  white-space: nowrap;
`;

export default Panel;
