import { FC, useLayoutEffect, useRef } from "react";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import Well from "../../../models/well.tsx";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import { WellIndicator } from "../../StyledComponents/WellIndicator.tsx";
import { Divider } from "@equinor/eds-core-react";
import styled from "styled-components";
import WellItem from "../WellItem";
import { UidMappingBasicInfo } from "../../../models/uidMapping.tsx";

const SidebarVirtualItem: FC<{
  virtualItem: VirtualItem<HTMLDivElement>;
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
  virtualItem: VirtualItem<HTMLDivElement>;
}>((props) => ({
  style: {
    transform: `translateY(${props.virtualItem.start}px)`
  }
}))<{ virtualItem: VirtualItem<HTMLDivElement> }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

export default SidebarVirtualItem;
