import { Server } from "../../../models/server.ts";
import { WITSML_INDEX_TYPE, WITSML_INDEX_TYPE_MD } from "../../Constants.tsx";
import React, { useContext, useMemo, useState } from "react";
import LogObject from "../../../models/logObject.tsx";
import ModalDialog, { ModalWidth } from "../ModalDialog.tsx";
import OperationType from "../../../contexts/operationType.ts";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "../../ContentViews/table";
import { Switch, Typography } from "@equinor/eds-core-react";
import styled from "styled-components";
import { useGetServers } from "../../../hooks/query/useGetServers.tsx";
import { CommonPanelContainer } from "../../StyledComponents/Container.tsx";
import {
  setLocalStorageItem,
  STORAGE_FILTER_PRIORITYSERVERS_KEY
} from "../../../tools/localStorageHelpers.tsx";
import { UserTheme } from "../../../contexts/operationStateReducer.tsx";
import { FilterContext } from "../../../contexts/filter.tsx";
import { useServerFilter } from "../../../hooks/useServerFilter.ts";
import { getMultipleLogCurveSelectionViewPath } from "../../../routes/utils/pathBuilder.ts";
import { RouterLogType } from "../../../routes/routerConstants.ts";
import { useNavigate } from "react-router-dom";
import LogCurvePriorityService from "../../../services/logCurvePriorityService.tsx";
import { MultiLogSelectionCurveInfo } from "../../MultiLogUtils.tsx";
import MultiLogSelectionRepository from "../../MultiLogSelectionRepository.tsx";
import { useConnectedServer } from "../../../contexts/connectedServerContext.tsx";

export const MULTI_LOG_MULTI_TARGET_COMPARISON_TYPE_MNEMONIC = "mnemonic";
export const MULTI_LOG_MULTI_TARGET_COMPARISON_TYPE_PRIORITIZED_CURVES =
  "prioritized curves";
export type MULTI_LOG_MULTI_TARGET_COMPARISON_TYPE =
  | typeof MULTI_LOG_MULTI_TARGET_COMPARISON_TYPE_MNEMONIC
  | typeof MULTI_LOG_MULTI_TARGET_COMPARISON_TYPE_PRIORITIZED_CURVES;

interface ServerRow extends ContentTableRow, Omit<Server, "id"> {
  server: Server;
}

export interface SelectComparisonServersModalProps {
  sourceServer: Server;
  comparisonType: MULTI_LOG_MULTI_TARGET_COMPARISON_TYPE;
  indexType: WITSML_INDEX_TYPE;
  logObject: LogObject;
  mnemonics?: string[];
}

const SelectComparisonServersModal = (
  props: SelectComparisonServersModalProps
): React.ReactElement => {
  const { sourceServer, comparisonType, indexType, logObject, mnemonics } =
    props;

  const {
    dispatchOperation,
    operationState: { colors, theme }
  } = useOperationState();
  const { servers, isFetching: isFetchingServers } = useGetServers();
  const { connectedServer } = useConnectedServer();
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const filteredServers = useServerFilter(servers);
  const navigate = useNavigate();

  const [selectedRows, setSelectedRows] = useState<ServerRow[]>([]);
  const [isFetchingPrioritizedCurves, setIsFetchingPrioritizedCurves] =
    useState<boolean>(false);

  const onCancel = async () => {
    dispatchOperation({ type: OperationType.HideModal });
  };

  const onSubmit = async () => {
    const multiLogSelectionCurveInfos: MultiLogSelectionCurveInfo[] = [];

    if (
      comparisonType ===
      MULTI_LOG_MULTI_TARGET_COMPARISON_TYPE_PRIORITIZED_CURVES
    ) {
      setIsFetchingPrioritizedCurves(true);

      const localPrioritizedCurves =
        await LogCurvePriorityService.getPrioritizedCurves(
          false,
          logObject.wellUid,
          logObject.wellboreUid
        );

      if (localPrioritizedCurves?.length > 0) {
        localPrioritizedCurves.forEach((curve) => {
          multiLogSelectionCurveInfos.push({
            serverId: sourceServer.id,
            wellId: logObject.wellUid,
            wellboreId: logObject.wellboreUid,
            logUid: logObject.uid,
            mnemonic: curve
          } as MultiLogSelectionCurveInfo);
        });
      }

      const universalPrioritizedCurves =
        await LogCurvePriorityService.getPrioritizedCurves(true);

      if (universalPrioritizedCurves?.length > 0) {
        universalPrioritizedCurves.forEach((curve) => {
          multiLogSelectionCurveInfos.push({
            serverId: sourceServer.id,
            wellId: logObject.wellUid,
            wellboreId: logObject.wellboreUid,
            logUid: logObject.uid,
            mnemonic: curve
          } as MultiLogSelectionCurveInfo);
        });
      }

      for (const row of selectedRows) {
        if (universalPrioritizedCurves?.length > 0) {
          universalPrioritizedCurves.forEach((curve) => {
            multiLogSelectionCurveInfos.push({
              serverId: row.server.id,
              wellId: logObject.wellUid,
              wellboreId: logObject.wellboreUid,
              logUid: logObject.uid,
              mnemonic: curve
            } as MultiLogSelectionCurveInfo);
          });
        }

        if (localPrioritizedCurves?.length > 0) {
          localPrioritizedCurves.forEach((curve) => {
            multiLogSelectionCurveInfos.push({
              serverId: row.server.id,
              wellId: logObject.wellUid,
              wellboreId: logObject.wellboreUid,
              logUid: logObject.uid,
              mnemonic: curve
            } as MultiLogSelectionCurveInfo);
          });
        }
      }

      setIsFetchingPrioritizedCurves(false);
    } else if (
      comparisonType === MULTI_LOG_MULTI_TARGET_COMPARISON_TYPE_MNEMONIC
    ) {
      for (const row of selectedRows) {
        mnemonics.forEach((mnemonic) => {
          multiLogSelectionCurveInfos.push({
            serverId: row.server.id,
            wellId: logObject.wellUid,
            wellboreId: logObject.wellboreUid,
            logUid: logObject.uid,
            mnemonic: mnemonic
          } as MultiLogSelectionCurveInfo);

          multiLogSelectionCurveInfos.push({
            serverId: sourceServer.id,
            wellId: logObject.wellUid,
            wellboreId: logObject.wellboreUid,
            logUid: logObject.uid,
            mnemonic: mnemonic
          } as MultiLogSelectionCurveInfo);
        });
      }
    }

    if (multiLogSelectionCurveInfos.length > 0) {
      MultiLogSelectionRepository.Instance.createMultiLogValues(
        indexType,
        multiLogSelectionCurveInfos
      );
    } else {
      MultiLogSelectionRepository.Instance.removeAllMultiLogValues(indexType);
    }

    dispatchOperation({ type: OperationType.HideModal });

    navigate({
      pathname: getMultipleLogCurveSelectionViewPath(
        connectedServer?.url,
        indexType === WITSML_INDEX_TYPE_MD
          ? RouterLogType.DEPTH
          : RouterLogType.TIME
      )
    });
  };

  const panelElements = [
    <CommonPanelContainer key="showPriority">
      <Switch
        checked={selectedFilter.filterPriorityServers}
        onChange={() => {
          setLocalStorageItem<boolean>(
            STORAGE_FILTER_PRIORITYSERVERS_KEY,
            !selectedFilter.filterPriorityServers
          );
          updateSelectedFilter({
            filterPriorityServers: !selectedFilter.filterPriorityServers
          });
        }}
        size={theme === UserTheme.Compact ? "small" : "default"}
      />
      <Typography
        style={{
          color: colors.infographic.primaryMossGreen,
          whiteSpace: "nowrap"
        }}
      >
        Only show priority servers
      </Typography>
    </CommonPanelContainer>
  ];

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "url", label: "url", type: ContentType.String }
  ];

  const tableData = useMemo((): ServerRow[] => {
    if (filteredServers?.length > 0) {
      return filteredServers
        .filter((s) => s.id !== sourceServer.id)
        .map((s) => {
          return { id: s.id, server: s, ...s } as ServerRow;
        });
    } else {
      return [];
    }
  }, [servers, filteredServers]);

  return (
    <>
      <ModalDialog
        heading={`Comparing ${comparisonType}`}
        confirmText={`Compare`}
        content={
          <ContentLayout>
            <Typography>
              Select servers to compare {comparisonType} to:
            </Typography>
            <ContentTable
              panelElements={panelElements}
              columns={columns}
              data={tableData}
              onRowSelectionChange={(rows) =>
                setSelectedRows(rows as ServerRow[])
              }
              checkableRows={true}
              stickyLeftColumns={1}
            />
          </ContentLayout>
        }
        switchButtonPlaces={true}
        onSubmit={() => onSubmit()}
        onCancel={() => onCancel()}
        isLoading={isFetchingServers || isFetchingPrioritizedCurves}
        confirmDisabled={!selectedRows || selectedRows.length < 1}
        width={ModalWidth.LARGE}
      />
    </>
  );
};

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export default SelectComparisonServersModal;
