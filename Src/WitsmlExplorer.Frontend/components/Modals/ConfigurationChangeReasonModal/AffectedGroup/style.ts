import styled, { css } from "styled-components";
import { Typography } from "@equinor/eds-core-react";

export const StyledListItem = styled.li<{ color: string }>`
  &:not(:last-child) {
    padding-bottom: 0.5rem;
  }

  ${({ color }) => css`
    color: ${`${color} !important`};

    *,
    & p {
      color: ${color} !important;
    }
  `}
`;

export const AffectedLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
`;

export const ListLabel = styled(Typography)`
  font-size: 14px;
`;

export const AffectedChannels = styled(Typography)`
  font-size: 12px;
  font-style: italic;
`;
