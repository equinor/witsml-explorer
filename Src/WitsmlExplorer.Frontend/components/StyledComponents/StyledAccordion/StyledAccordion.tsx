import { Accordion } from "@equinor/eds-core-react";
import styled, { css } from "styled-components";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import { UserTheme } from "../../../contexts/operationStateReducer.tsx";
import { CSSProperties, FC, ReactNode } from "react";

type StyledAccordionProps = {
  children: ReactNode;
  style?: CSSProperties;
};

const StyledAccordion: FC<StyledAccordionProps> = ({ children, style }) => {
  const {
    operationState: { theme }
  } = useOperationState();
  const isCompact = theme === UserTheme.Compact;

  return (
    <StyledRawAccordion style={style} isCompact={isCompact}>
      {children}
    </StyledRawAccordion>
  );
};

export default StyledAccordion;

const StyledRawAccordion = styled(Accordion)<{
  isCompact: boolean;
}>`
  ${({ isCompact }) => {
    if (isCompact)
      return css`
        h2 {
          height: auto;
          padding: 0;

          button {
            padding: 0.4rem 0.8rem;
          }
        }
      `;
    return "";
  }}
`;
