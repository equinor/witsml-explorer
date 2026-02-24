import { Server } from "../../../models/server.ts";
import { WITSML_INDEX_TYPE } from "../../Constants.tsx";
import React, { useContext, useMemo, useState } from "react";
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
import { MultiLogSelectionCurveInfo } from "../../MultiLogUtils.tsx";
import MultiLogSelectionRepository from "../../MultiLogSelectionRepository.tsx";
import { useConnectedServer } from "../../../contexts/connectedServerContext.tsx";
import WellboreService from "../../../services/wellboreService.tsx";
import MnemonicsMappingService from "../../../services/mnemonicsMappingService.tsx";
import ObjectService from "../../../services/objectService.tsx";
import { ObjectType } from "../../../models/objectType.ts";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "../UserCredentialsModal.tsx";
import AuthorizationService from "../../../services/authorizationService.ts";
import { LoggedInUsernamesActionType } from "../../../contexts/loggedInUsernamesReducer.tsx";
import { useLoggedInUsernames } from "../../../contexts/loggedInUsernamesContext.tsx";

interface ServerRow extends ContentTableRow, Omit<Server, "id"> {
  server: Server;
}

export interface GlobalMnemonicsLoadingModalProps {
  indexType: WITSML_INDEX_TYPE;
  mnemonicsToLoad: { wellboreName: string; mnemonicName: string }[];
}

const GlobalMnemonicsLoadingModal = (
  props: GlobalMnemonicsLoadingModalProps
): React.ReactElement => {
  const { indexType, mnemonicsToLoad } = props;

  const {
    dispatchOperation,
    operationState: { colors, theme }
  } = useOperationState();
  const { servers, isFetching: isFetchingServers } = useGetServers();
  const { connectedServer } = useConnectedServer();
  const { dispatchLoggedInUsernames } = useLoggedInUsernames();
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const filteredServers = useServerFilter(servers);

  const [selectedRows, setSelectedRows] = useState<ServerRow[]>([]);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState<boolean>(false);

  const onCancel = async () => {
    dispatchOperation({ type: OperationType.HideModal });
  };

  const onSubmit = async () => {
    const multiLogSelectionCurveInfos: MultiLogSelectionCurveInfo[] = [];

    setIsFetchingMetadata(true);
    for (const row of selectedRows) {
      for (const mnemonicToLoad of mnemonicsToLoad) {
        const server = row.server;

        if (!!connectedServer && server.id != connectedServer.id) {
          let finished = false;

          const userCredentialsModalProps: UserCredentialsModalProps = {
            server: server,
            onConnectionVerified: (username) => {
              dispatchOperation({ type: OperationType.HideModal });
              AuthorizationService.onAuthorized(server, username);
              dispatchLoggedInUsernames({
                type: LoggedInUsernamesActionType.AddLoggedInUsername,
                payload: { serverId: server.id, username }
              });
              finished = true;
            },
            onCancel: () => {
              finished = true;
            }
          };
          dispatchOperation({
            type: OperationType.DisplayModal,
            payload: <UserCredentialsModal {...userCredentialsModalProps} />
          });
          while (!finished) {
            await new Promise((f) => setTimeout(f, 1000));
          }
        }

        const targetWellbore = await WellboreService.getWellboreByName(
          mnemonicToLoad.wellboreName,
          undefined,
          server
        );

        if (targetWellbore) {
          const mnemonicsMappings =
            await MnemonicsMappingService.queryMnemonicsMappings({
              returnGlobalMnemonics: false,
              sourceVendorsMnemonics: [mnemonicToLoad.mnemonicName]
            });

          if (mnemonicsMappings?.mappings?.length > 0) {
            const logs = await ObjectService.getObjects(
              targetWellbore.wellUid,
              targetWellbore.uid,
              ObjectType.Log,
              null,
              row.server
            );

            for (const log of logs) {
              for (const mnemonicMapping of mnemonicsMappings.mappings) {
                multiLogSelectionCurveInfos.push({
                  serverId: row.server.id,
                  wellId: targetWellbore.wellUid,
                  wellboreId: targetWellbore.uid,
                  logUid: log.uid,
                  mnemonic: mnemonicMapping.vendorMnemonicName
                } as MultiLogSelectionCurveInfo);
              }
            }
          }
        }
      }
    }

    setIsFetchingMetadata(false);
    dispatchOperation({ type: OperationType.HideModal });

    if (multiLogSelectionCurveInfos.length > 0) {
      MultiLogSelectionRepository.Instance.addMultiLogValues(
        indexType,
        multiLogSelectionCurveInfos,
        true
      );
    }
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
    {
      property: "url",
      label: "url",
      type: ContentType.String,
      width: 500
    }
  ];

  const tableData = useMemo((): ServerRow[] => {
    if (filteredServers?.length > 0) {
      return filteredServers.map((s) => {
        return { id: s.id, server: s, ...s } as ServerRow;
      });
    } else {
      return [];
    }
  }, [servers, filteredServers]);

  return (
    <>
      <ModalDialog
        heading={`Pick Servers to Load From`}
        confirmText={`Load`}
        content={
          <ContentLayout>
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
        isLoading={isFetchingServers || isFetchingMetadata}
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

export default GlobalMnemonicsLoadingModal;
