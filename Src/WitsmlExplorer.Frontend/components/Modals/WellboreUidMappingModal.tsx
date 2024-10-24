import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { TextField } from "@mui/material";
import ModalDialog from "./ModalDialog.tsx";
import Wellbore, {
  calculateWellboreNodeId,
  calculateWellNodeId
} from "../../models/wellbore.tsx";
import styled from "styled-components";
import { Typography, Icon } from "@equinor/eds-core-react";
import { Server } from "../../models/server.ts";
import { useOperationState } from "../../hooks/useOperationState.tsx";
import OperationType from "../../contexts/operationType.ts";
import { useGetWells } from "../../hooks/query/useGetWells.tsx";
import { useGetWellbores } from "../../hooks/query/useGetWellbores.tsx";
import Well from "../../models/well.tsx";
import { Colors } from "../../styles/Colors.tsx";
import { Button } from "../StyledComponents/Button.tsx";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import UidMappingService from "../../services/uidMappingService.tsx";
import { UidMapping, UidMappingDbQuery } from "../../models/uidMapping.tsx";
import ProgressSpinner from "../ProgressSpinner.tsx";
import { useConnectedServer } from "../../contexts/connectedServerContext.tsx";

interface WellboreTreeItem {
  id: string;
  name: string;
  wellbore: Wellbore;
}

interface WellTreeItem {
  id: string;
  name: string;
  well: Well;
  children: WellboreTreeItem[];
}

export interface WellboreUidMappingModalProps {
  wellbore: Wellbore;
  targetServer: Server;
}

const WellboreUidMappingModal = (
  props: WellboreUidMappingModalProps
): React.ReactElement => {
  const { wellbore, targetServer } = props;

  const {
    dispatchOperation,
    operationState: { colors }
  } = useOperationState();
  const { connectedServer } = useConnectedServer();

  const { wells, isFetching: isFetchingWells } = useGetWells(targetServer, {
    placeholderData: []
  });
  const { wellbores, isFetching: isFetchingWellbores } = useGetWellbores(
    targetServer,
    "",
    { placeholderData: [] }
  );
  const [isFetchingUidMapping, setIsFetchingUidMapping] =
    useState<boolean>(true);

  const [wellboreFilterValue, setWellboreFilterValue] = useState<string>("");
  const [expandedWellTreeItems, setExpandedWellTreeItems] = useState<string[]>(
    []
  );
  const [selectedWellbore, setSelectedWellbore] = useState<Wellbore>(undefined);
  const [loadedWellboreNodeId, setLoadedWellboreNodeId] =
    useState<string>(undefined);

  useEffect(() => {
    const dbQuery: UidMappingDbQuery = {
      sourceServerId: connectedServer.id,
      sourceWellId: wellbore.wellUid,
      sourceWellboreId: wellbore.uid,
      targetServerId: targetServer.id
    };

    UidMappingService.queryUidMapping(dbQuery)
      .then((mappings) => {
        if (mappings.length > 0) {
          setWellboreFilterValue(mappings[0].targetWellboreId);
          setLoadedWellboreNodeId(
            calculateWellboreNodeId({
              uid: mappings[0].targetWellboreId,
              wellUid: mappings[0].targetWellId
            } as Wellbore)
          );
        } else {
          setWellboreFilterValue(wellbore.name);
        }
      })
      .finally(() => setIsFetchingUidMapping(false));
  }, []);

  const getFilteredTreeData = (wells: Well[], wellbores: Wellbore[]) => {
    const data: WellTreeItem[] = [];

    if (!!wells && wells.length > 0 && !!wellbores && wellbores.length > 0) {
      wells = wells.toSorted((a, b) => a.name.localeCompare(b.name));
      wellbores = wellbores.toSorted((a, b) => a.name.localeCompare(b.name));

      for (const well of wells) {
        const filteredWellboreTreeItems = wellbores
          .filter(
            (wb) =>
              wb.wellUid == well.uid &&
              (wb.name
                .toLocaleLowerCase()
                .includes(wellboreFilterValue.toLocaleLowerCase()) ||
                wb.uid
                  .toLocaleLowerCase()
                  .includes(wellboreFilterValue.toLocaleLowerCase()))
          )
          .map(
            (wb) =>
              ({
                id: calculateWellboreNodeId(wb),
                name: wb.name + " {" + wb.uid + "}",
                wellbore: wb
              } as WellboreTreeItem)
          );

        if (
          !!filteredWellboreTreeItems &&
          filteredWellboreTreeItems.length > 0
        ) {
          const wellTreeItem: WellTreeItem = {
            id: calculateWellNodeId(well.uid),
            name: well.name,
            well: well,
            children: filteredWellboreTreeItems
          };
          data.push(wellTreeItem);
        }
      }
      setExpandedWellTreeItems(data.map((wti) => wti.id));
    }
    return data;
  };

  const filteredTreeData = useMemo(
    () => getFilteredTreeData(wells, wellbores),
    [wellboreFilterValue, wells, wellbores, isFetchingUidMapping]
  );

  const renderWellWellboreTree = (treeData: WellTreeItem[]) => {
    return treeData.map((wti) => (
      <TreeItem
        key={wti.id}
        nodeId={wti.id}
        label={wti.name}
        onClick={() => {
          if (expandedWellTreeItems.includes(wti.id)) {
            setExpandedWellTreeItems(
              expandedWellTreeItems.filter((i) => i !== wti.id)
            );
          } else {
            setExpandedWellTreeItems(expandedWellTreeItems.concat(wti.id));
          }
          setSelectedWellbore(undefined);
        }}
      >
        {wti.children.map((wbti) => (
          <TreeItem
            key={wbti.id}
            nodeId={wbti.id}
            label={wbti.name}
            onClick={() => setSelectedWellbore(wbti.wellbore)}
          ></TreeItem>
        ))}
      </TreeItem>
    ));
  };

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });

    if (selectedWellbore) {
      const uidMapping: UidMapping = {
        sourceServerId: connectedServer.id,
        sourceWellId: wellbore.wellUid,
        sourceWellboreId: wellbore.uid,
        targetServerId: targetServer.id,
        targetWellId: selectedWellbore.wellUid,
        targetWellboreId: selectedWellbore.uid
      };

      if (loadedWellboreNodeId) {
        await UidMappingService.updateUidMapping(uidMapping);
      } else {
        await UidMappingService.addUidMapping(uidMapping);
      }
    }
  };

  return (
    <>
      <ModalDialog
        heading={
          `Wellbore UID Mapping` + (loadedWellboreNodeId ? ` - Update` : ``)
        }
        confirmText={`Save`}
        content={
          <ContentLayout>
            <Typography>
              Mapping wellbore <b>{wellbore.name}</b> with UID{" "}
              <b>&#123;{wellbore.uid}&#125;</b> to a wellbore on server{" "}
              <b>{targetServer.name}</b>:
            </Typography>
            <FilterField
              id="wellboreFilter"
              type="text"
              disabled={
                isFetchingWells || isFetchingWellbores || isFetchingUidMapping
              }
              value={wellboreFilterValue}
              colors={colors}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setWellboreFilterValue(e.target.value)
              }
              InputProps={{
                endAdornment: (
                  <SearchIconLayout>
                    {wellboreFilterValue && (
                      <Button
                        variant="ghost_icon"
                        onClick={() => setWellboreFilterValue("")}
                        aria-label="Clear"
                      >
                        <Icon
                          name={"clear"}
                          color={colors.interactive.primaryResting}
                          size={18}
                        />
                      </Button>
                    )}
                    <Icon
                      name="search"
                      color={colors.interactive.primaryResting}
                    />
                  </SearchIconLayout>
                ),
                classes: {
                  adornedStart: "small-padding-left",
                  adornedEnd: "small-padding-right"
                }
              }}
            />
            <WellWellboreTreeLayout>
              {isFetchingWells ||
              isFetchingWellbores ||
              isFetchingUidMapping ? (
                <ProgressSpinner message="Fetching data." />
              ) : (
                <TreeView
                  aria-label="rich object"
                  defaultCollapseIcon={
                    <Icon
                      name="chevronDown"
                      color={colors.interactive.primaryResting}
                    />
                  }
                  expanded={expandedWellTreeItems}
                  defaultExpandIcon={
                    <Icon
                      name="chevronRight"
                      color={colors.interactive.primaryResting}
                    />
                  }
                >
                  {renderWellWellboreTree(filteredTreeData)}
                </TreeView>
              )}
            </WellWellboreTreeLayout>
          </ContentLayout>
        }
        onSubmit={() => onSubmit()}
        isLoading={
          isFetchingWells || isFetchingWellbores || isFetchingUidMapping
        }
        confirmDisabled={!selectedWellbore}
      />
    </>
  );
};

const FilterField = styled(TextField)<{ colors: Colors }>`
  &&& > div > fieldset {
    border-color: ${(props) => props.colors.interactive.primaryResting};
  }
`;

const SearchIconLayout = styled.div`
  display: flex;
  align-items: center;
`;

const WellWellboreTreeLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 50vh;
  max-height: 50vh;
  overflow-x: scroll;
`;

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export default WellboreUidMappingModal;
