import styled, { css } from "styled-components";
import { Chip } from "../../../StyledComponents/Chip";

export type TableFriendlyType = { $tableFriendly?: boolean };

export const StyledStatusChip = styled(Chip)<TableFriendlyType>`
  ${({ $tableFriendly }) =>
    $tableFriendly
      ? css`
          height: auto;
          line-height: 1rem;
          border-radius: 0.8rem;
        `
      : ""}
`;
