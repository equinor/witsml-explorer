import { TableCell } from "@mui/material";
import styled from "styled-components";
import { Colors, light } from "styles/Colors";

export const TableContainer = styled.div<{ showPanel?: boolean }>`
  overflow-y: auto;
  height: 100%;
  ${(props) =>
    props.showPanel
      ? `
    display: grid;
    grid-template-rows: auto 1fr;
  `
      : ""}
`;

export const StyledTable = styled.table`
  width: 100%;
  border-spacing: 0;
`;

export const StyledResizer = styled.div<{ isResizing?: boolean }>`
  right: 0;
  top: 0;
  position: absolute;
  height: 100%;
  width: 7px;
  background: rgba(0, 0, 0, 0.5);
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  opacity: 0;
  ${(props) =>
    props.isResizing
      ? `&{
    background: ${light.infographic.primaryMossGreen};
    opacity: 1;
  }`
      : ""}
  &:hover {
    opacity: 1;
  }
`;

export const StyledTr = styled.tr<{ selected?: boolean; colors: Colors }>`
  display: flex;
  width: fit-content;
  position: absolute;
  top: 0;
  left: 0;
  &&& {
    background-color: ${(props) =>
      props.selected
        ? props.colors.interactive.textHighlight
        : props.colors.ui.backgroundDefault};
  }
  &&&:nth-of-type(even) {
    background-color: ${(props) =>
      props.selected
        ? props.colors.interactive.textHighlight
        : props.colors.interactive.tableHeaderFillResting};
  }
  &&&:hover {
    background-color: ${(props) =>
      props.colors.interactive.tableCellFillActivated};
  }
`;

export const StyledTh = styled(TableCell)<{ sticky?: number; colors: Colors }>`
  && {
    border-right: 1px solid rgba(224, 224, 224, 1);
    border-bottom-width: 2px;
    background-color: ${(props) =>
      props.colors.interactive.tableHeaderFillResting};
    color: ${(props) => props.colors.text.staticIconsDefault};
    text-align: center;
    font-family: EquinorMedium, Arial, sans-serif;
    position: relative;
  }
  > div {
    font-feature-settings: "tnum";
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  ${(props) => (props.sticky ? "&&&{ position: sticky; z-index: 3; }" : "")}
`;

export const StyledTd = styled(TableCell)<{
  clickable?: number;
  sticky?: number;
  colors: Colors;
}>`
  border-right: 1px solid rgba(224, 224, 224, 1);
  background-color: inherit;
  z-index: 0;
  && {
    color: ${(props) => props.colors.text.staticIconsDefault};
    font-family: EquinorMedium;
  }
  cursor: ${(props) => (props.clickable ? "pointer" : "arrow")};
  font-feature-settings: "tnum";
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${(props) => (props.sticky ? "&&&{ position: sticky; z-index: 2; }" : "")}
`;
