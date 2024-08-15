import { FC, useEffect, useRef } from "react";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import Well from "../../../models/well.tsx";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import { UserTheme } from "../../../contexts/operationStateReducer.tsx";
import WellItem from "../WellItem.tsx";
import { WellIndicator } from "../../StyledComponents/WellIndicator.tsx";
import { Divider } from "@equinor/eds-core-react";
import styled from "styled-components";

const SidebarVirtualItem: FC<{
  virtualItem: VirtualItem;
  well: Well;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
}> = ({ virtualItem, well, virtualizer }) => {
  const {
    operationState: { colors, theme }
  } = useOperationState();
  const rowRef = useRef<HTMLDivElement>();
  const isCompactMode = theme === UserTheme.Compact;

  useEffect(() => {
    if (rowRef.current) virtualizer.measureElement(rowRef.current);
  }, [rowRef]);

  return (
    <StyledVirtualItem
      key={well.uid}
      data-index={virtualItem.index}
      ref={rowRef}
      virtualItem={virtualItem}
    >
      <WellListing>
        <WellItem wellUid={well.uid} />
        <WellIndicator
          compactMode={isCompactMode}
          active={well.isActive}
          colors={colors}
        />
      </WellListing>
      <Divider
        style={{
          margin: "0px",
          backgroundColor: colors.interactive.disabledBorder
        }}
      />
    </StyledVirtualItem>
  );
};

const WellListing = styled.div`
  display: grid;
  grid-template-columns: 1fr 18px;
  justify-content: center;
  align-content: stretch;
`;

const StyledVirtualItem = styled.div.attrs<{ virtualItem: VirtualItem }>(
  (props) => ({
    style: {
      transform: `translateY(${props.virtualItem.start}px)`
    }
  })
)<{ virtualItem: VirtualItem }>`
  position: absolute;
  width: 100%;
`;

export default SidebarVirtualItem;
