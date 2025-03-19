import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
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
import { Colors } from "../../styles/Colors.tsx";
import UidMappingService from "../../services/uidMappingService.tsx";
import { UidMapping, UidMappingDbQuery } from "../../models/uidMapping.tsx";
import ProgressSpinner from "../ProgressSpinner.tsx";
import { useConnectedServer } from "../../contexts/connectedServerContext.tsx";
import { debounce } from "lodash";
import WellWellboreTree, {
  WellboreTreeItem,
  WellTreeItem
} from "../WellWellboreTree.tsx";
import { refreshUidMappingBasicInfos } from "../../hooks/query/queryRefreshHelpers.tsx";
import { useQueryClient } from "@tanstack/react-query";

export interface WellboreUidMappingModalProps {
  wellbore: Wellbore;
  targetServer: Server;
  onModalClose?: () => void;
}

const WellboreUidMappingModal = (
  props: WellboreUidMappingModalProps
): React.ReactElement => {
  const { wellbore, targetServer, onModalClose } = props;

  const {
    dispatchOperation,
    operationState: { colors }
  } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();

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

  const loadedWells = useMemo(() => {
    if (!isFetchingWells && !!wells && wells.length > 0) {
      return wells.toSorted((a, b) => a.name.localeCompare(b.name));
    } else {
      return [];
    }
  }, [wells]);

  const loadedWellbores = useMemo(() => {
    if (!isFetchingWellbores && !!wellbores && wellbores.length > 0) {
      return wellbores?.toSorted((a, b) => a.name.localeCompare(b.name));
    } else {
      return [];
    }
  }, [wellbores]);

  const treeData = useMemo(() => {
    const data: WellTreeItem[] = [];

    for (const well of loadedWells) {
      const wellboreTreeItems = loadedWellbores
        .filter((wb) => wb.wellUid == well.uid)
        .map(
          (wb) =>
            ({
              id: calculateWellboreNodeId(wb),
              name: wb.name + " {" + wb.uid + "}",
              wellbore: wb
            } as WellboreTreeItem)
        );

      if (!!wellboreTreeItems && wellboreTreeItems.length > 0) {
        const wellTreeItem: WellTreeItem = {
          id: calculateWellNodeId(well.uid),
          name: well.name,
          well: well,
          children: wellboreTreeItems
        };
        data.push(wellTreeItem);
      }
    }

    return data;
  }, [loadedWells, loadedWellbores, isFetchingUidMapping]);

  const filteredTreeData = useMemo(() => {
    const filteredData: WellTreeItem[] = [];

    if (
      !isFetchingUidMapping &&
      !!loadedWells &&
      loadedWells.length > 0 &&
      !!loadedWellbores &&
      loadedWellbores.length > 0
    ) {
      for (const wellItem of treeData) {
        const filteredWellboreTreeItems = wellItem.children.filter(
          (wb) =>
            wb.name
              .toLocaleLowerCase()
              .includes(wellboreFilterValue.toLocaleLowerCase()) ||
            wb.id
              .toLocaleLowerCase()
              .includes(wellboreFilterValue.toLocaleLowerCase())
        );

        if (
          !!filteredWellboreTreeItems &&
          filteredWellboreTreeItems.length > 0
        ) {
          const filteredWellTreeItem: WellTreeItem = {
            id: wellItem.id,
            name: wellItem.name,
            well: wellItem.well,
            children: filteredWellboreTreeItems
          };
          filteredData.push(filteredWellTreeItem);
        }
      }
      setExpandedWellTreeItems(
        wellboreFilterValue?.length > 0 ? filteredData.map((wti) => wti.id) : []
      );
    }
    return filteredData;
  }, [loadedWells, loadedWellbores, isFetchingUidMapping, wellboreFilterValue]);

  const debouncedSetWellboreFilterValue = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      setWellboreFilterValue(e.target.value);
    }, 500),
    []
  );

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

      refreshUidMappingBasicInfos(queryClient);

      if (onModalClose) {
        onModalClose();
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
          isFetchingWells || isFetchingWellbores || isFetchingUidMapping ? (
            <ProgressSpinner message="Fetching data." />
          ) : (
            <ContentLayout>
              <Typography>
                Mapping wellbore <b>{wellbore.name}</b> with UID{" "}
                <b>&#123;{wellbore.uid}&#125;</b> to a wellbore on server{" "}
                <b>{targetServer.name}</b>:
              </Typography>
              <FilterField
                id="wellboreFilter"
                type="text"
                defaultValue={wellboreFilterValue}
                colors={colors}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  debouncedSetWellboreFilterValue(e)
                }
                InputProps={{
                  endAdornment: (
                    <SearchIconLayout>
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
              <WellWellboreTree
                treeData={filteredTreeData}
                expandedWells={expandedWellTreeItems}
                onSelectedWellbore={(wellbore) => setSelectedWellbore(wellbore)}
                onNodeToggle={(_, nodeIs) => setExpandedWellTreeItems(nodeIs)}
              ></WellWellboreTree>
            </ContentLayout>
          )
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

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export default WellboreUidMappingModal;
