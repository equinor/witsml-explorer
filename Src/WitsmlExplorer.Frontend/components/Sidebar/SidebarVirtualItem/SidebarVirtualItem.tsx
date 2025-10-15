import { Divider } from "@equinor/eds-core-react";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { FC, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import { UidMappingBasicInfo } from "../../../models/uidMapping.tsx";
import Well from "../../../models/well.tsx";
import { WellIndicator } from "../../StyledComponents/WellIndicator.tsx";
import WellItem from "../WellItem";

const SidebarVirtualItem: FC<{
  virtualItem: VirtualItem;
  well: Well;
  uidMappingBasicInfos: UidMappingBasicInfo[];
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  isExpanded: boolean;
}> = ({ virtualItem, well, uidMappingBasicInfos, virtualizer, isExpanded }) => {
  const {
    operationState: { colors, theme }
  } = useOperationState();
  const rowRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    if (rowRef.current) virtualizer.measureElement(rowRef.current);
  }, [isExpanded]);

  return (
    <StyledVirtualItem
      key={well.uid}
      data-index={virtualItem.index}
      ref={rowRef}
      virtualItem={virtualItem}
    >
      <WellListing>
        <WellItem
          wellUid={well.uid}
          uidMappingBasicInfos={uidMappingBasicInfos}
        />
        <WellIndicator
          themeMode={theme}
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

const StyledVirtualItem = styled.div.attrs<{
  virtualItem: VirtualItem;
}>((props) => ({
  style: {
    transform: `translateY(${props.virtualItem.start}px)`
  }
}))<{ virtualItem: VirtualItem }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

export default SidebarVirtualItem;
