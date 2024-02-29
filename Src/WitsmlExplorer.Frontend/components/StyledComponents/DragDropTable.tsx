import styled from "styled-components";
import { Colors } from "../../styles/Colors";

export const DummyDrop = styled.div<{ isDraggedOver?: number; colors: Colors }>`
  border-top: 2px solid ${(props) => props.colors.ui.backgroundLight};
  ${(props) =>
    props.isDraggedOver
      ? `&&&{
    border-top: 2px solid ${props.colors.infographic.primaryMossGreen};
  }`
      : ""}
`;

export const Draggable = styled.div<{
  isDragged?: number;
  isDraggedOver?: number;
  draggingStarted?: number;
  colors: Colors;
}>`
  cursor: grab;
  user-select: none;
  height: 100%;
  display: flex;
  ${(props) =>
    props.isDragged
      ? `&&&{ background: ${props.colors.interactive.textHighlight}; }`
      : ""}
  ${(props) =>
    props.isDraggedOver
      ? `&&&{
    border-top: 2px solid ${props.colors.infographic.primaryMossGreen};
}`
      : ""}
  ${(props) =>
    props.draggingStarted
      ? ""
      : `&:hover { background: ${props.colors.interactive.textHighlight}; }`}
`;
