import React, { FC, PropsWithChildren } from "react";
import {
  AffectedChannels,
  AffectedLayout,
  ListLabel,
  StyledListItem
} from "./style.ts";

type AffectedGroupProps = PropsWithChildren<{
  color: string;
  label: string;
}>;

const AffectedGroup: FC<AffectedGroupProps> = ({ color, label, children }) => (
  <StyledListItem color={color}>
    <AffectedLayout>
      <ListLabel>{label}</ListLabel>
      <AffectedChannels>{children}</AffectedChannels>
    </AffectedLayout>
  </StyledListItem>
);

export default AffectedGroup;
