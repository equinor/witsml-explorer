import { Server } from "../../models/server.ts";
import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { useGetServers } from "../../hooks/query/useGetServers.tsx";
import { useGetWellbores } from "../../hooks/query/useGetWellbores.tsx";
import { UidMapping, UidMappingDbQuery } from "../../models/uidMapping.tsx";
import UidMappingService from "../../services/uidMappingService.tsx";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "../ContentViews/table";
import { Colors } from "../../styles/Colors.tsx";
import styled, { css } from "styled-components";
import { Autocomplete, Dialog } from "@equinor/eds-core-react";
import { useOperationState } from "../../hooks/useOperationState.tsx";
import OperationType from "../../contexts/operationType.ts";
import ProgressSpinner from "../ProgressSpinner.tsx";
import { Button } from "../StyledComponents/Button.tsx";
import WellboreUidMappingModal, {
  WellboreUidMappingModalProps
} from "./WellboreUidMappingModal.tsx";
import { DisplayModalAction } from "../../contexts/operationStateReducer.tsx";
import { calculateWellboreNodeId } from "../../models/wellbore.tsx";
import { refreshUidMappingBasicInfos } from "../../hooks/query/queryRefreshHelpers.tsx";
import { useQueryClient } from "@tanstack/react-query";

interface UidMappingRow extends ContentTableRow {
  sourceWellId: string;
  sourceWellName: string;
  sourceWellboreId: string;
  sourceWellboreName: string;
  targetWellId: string;
  targetWellName: string;
  targetWellboreId: string;
  targetWellboreName: string;
  username: string;
  timestamp: string;
}

const WellboreUidMappingOverviewModal = (): React.ReactElement => {
  const { servers } = useGetServers();
  const {
    dispatchOperation,
    operationState: { colors }
  } = useOperationState();
  const queryClient = useQueryClient();

  const [sourceServerValue, setSourceServerValue] = useState<Server>(undefined);
  const [targetServerValue, setTargetServerValue] = useState<Server>(undefined);

  const [isFetchingUidMapping, setIsFetchingUidMapping] =
    useState<boolean>(false);
  const [mappings, setMappings] = useState<UidMapping[]>([]);

  const [selectedRows, setSelectedRows] = useState<UidMappingRow[]>([]);

  const { wellbores: sourceWellbores, isFetching: isFetchingSourceWellbores } =
    useGetWellbores(sourceServerValue, "", { placeholderData: [] });

  const { wellbores: targetWellbores, isFetching: isFetchingTargetWellbores } =
    useGetWellbores(targetServerValue, "", { placeholderData: [] });

  useEffect(() => {
    if (
      !!sourceServerValue &&
      !!targetServerValue &&
      !isFetchingSourceWellbores &&
      !isFetchingTargetWellbores
    ) {
      loadMappings();
    }
  }, [sourceServerValue, targetServerValue, sourceWellbores, targetWellbores]);

  const loadMappings = () => {
    const dbQuery: UidMappingDbQuery = {
      sourceServerId: sourceServerValue.id,
      targetServerId: targetServerValue.id
    };

    setSelectedRows([]);

    setIsFetchingUidMapping(true);

    UidMappingService.queryUidMapping(dbQuery)
      .then((mappings) => {
        if (mappings.length > 0) {
          setMappings(mappings);
        } else {
          setMappings([]);
        }
      })
      .finally(() => setIsFetchingUidMapping(false));
  };

  const tableData = useMemo((): UidMappingRow[] => {
    const mappingRows: UidMappingRow[] = [];

    if (!!sourceServerValue && !!targetServerValue) {
      for (const mapping of mappings) {
        const sourceWellbore = sourceWellbores.find(
          (wb) => wb.uid === mapping.sourceWellboreId
        );

        const targetWellbore = targetWellbores.find(
          (wb) => wb.uid === mapping.targetWellboreId
        );

        const row: UidMappingRow = {
          id:
            calculateWellboreNodeId(sourceWellbore) +
            calculateWellboreNodeId(targetWellbore) +
            mapping.timestamp,
          sourceWellId: sourceWellbore.wellUid,
          sourceWellName: sourceWellbore.wellName,
          sourceWellboreId: sourceWellbore.uid,
          sourceWellboreName: sourceWellbore.name,
          targetWellId: targetWellbore.wellUid,
          targetWellName: targetWellbore.wellName,
          targetWellboreId: targetWellbore.uid,
          targetWellboreName: targetWellbore.name,
          username: mapping.username,
          timestamp: mapping.timestamp
        };

        mappingRows.push(row);
      }
    }

    return mappingRows;
  }, [
    isFetchingUidMapping,
    mappings,
    sourceWellbores,
    targetWellbores,
    sourceServerValue,
    targetServerValue
  ]);

  const columns: ContentTableColumn[] = [
    {
      property: "sourceWellboreName",
      label: "Source Wellbore Name",
      type: ContentType.String
    },
    {
      property: "sourceWellboreId",
      label: "Source Wellbore Id",
      type: ContentType.String
    },
    {
      property: "sourceWellName",
      label: "Source Well Name",
      type: ContentType.String
    },
    {
      property: "sourceWellId",
      label: "Source Well Id",
      type: ContentType.String
    },
    {
      property: "targetWellboreName",
      label: "Target Wellbore Name",
      type: ContentType.String
    },
    {
      property: "targetWellboreId",
      label: "Target Wellbore Id",
      type: ContentType.String
    },
    {
      property: "targetWellName",
      label: "Target Well Name",
      type: ContentType.String
    },
    {
      property: "targetWellId",
      label: "Target Well Id",
      type: ContentType.String
    },
    { property: "username", label: "User Name", type: ContentType.String },
    { property: "timestamp", label: "Timestamp", type: ContentType.String }
  ];

  const onDelete = async () => {
    if (selectedRows.length > 0) {
      for (const row of selectedRows) {
        const deleteQuery: UidMappingDbQuery = {
          sourceServerId: sourceServerValue.id,
          sourceWellId: row.sourceWellId,
          sourceWellboreId: row.sourceWellboreId,
          targetServerId: targetServerValue.id,
          targetWellId: row.targetWellId,
          targetWellboreId: row.targetWellboreId
        };

        await UidMappingService.removeUidMapping(deleteQuery);
      }
      refreshUidMappingBasicInfos(queryClient);
      loadMappings();
    }
  };

  const onEdit = () => {
    if (selectedRows.length == 1) {
      const wellboreUidMappingModalProps: WellboreUidMappingModalProps = {
        wellbore: sourceWellbores.find(
          (wb) => wb.uid === selectedRows[0].sourceWellboreId
        ),
        targetServer: targetServerValue,
        onModalClose: () => loadMappings()
      };
      const action: DisplayModalAction = {
        type: OperationType.DisplayModal,
        payload: <WellboreUidMappingModal {...wellboreUidMappingModalProps} />
      };
      dispatchOperation(action);
    }
  };

  const onClose = () => {
    dispatchOperation({ type: OperationType.HideModal });
  };

  const dialogStyle = {
    width: "60vw",
    background: colors.ui.backgroundDefault,
    color: colors.text.staticIconsDefault
  };

  return (
    <>
      <Dialog open={true} style={dialogStyle}>
        <DialogHeader colors={colors}>
          <Dialog.Title style={{ color: colors.text.staticIconsDefault }}>
            Wellbore UID Mapping Overview
          </Dialog.Title>
        </DialogHeader>
        <Dialog.CustomContent>
          <ContentLayout>
            <HeaderLayout>
              <ServerItemLayout>
                <StyledAutocomplete
                  id={"sourceServer"}
                  label={"Source server:"}
                  optionLabel={(s: Server) => `${s.name}`}
                  options={servers}
                  onOptionsChange={(changes) => {
                    setMappings([]);
                    setSourceServerValue(changes.selectedItems[0] as Server);
                  }}
                  style={
                    {
                      "--eds-input-background": colors.ui.backgroundDefault
                    } as CSSProperties
                  }
                  colors={colors}
                />
              </ServerItemLayout>
              <ServerItemLayout>
                <StyledAutocomplete
                  id={"targetServer"}
                  label={"Target server:"}
                  optionLabel={(s: Server) => `${s.name}`}
                  options={servers}
                  onOptionsChange={(changes) => {
                    setMappings([]);
                    setTargetServerValue(changes.selectedItems[0] as Server);
                  }}
                  style={
                    {
                      "--eds-input-background": colors.ui.backgroundDefault
                    } as CSSProperties
                  }
                  colors={colors}
                />
              </ServerItemLayout>
            </HeaderLayout>
            <BodyLayout>
              {isFetchingUidMapping ||
              isFetchingSourceWellbores ||
              isFetchingTargetWellbores ? (
                <ProgressSpinner message="Fetching data" />
              ) : (
                <ContentTable
                  viewId={"uidMappingView"}
                  columns={columns}
                  data={tableData}
                  checkableRows
                  onRowSelectionChange={(rows) =>
                    setSelectedRows(rows as UidMappingRow[])
                  }
                />
              )}
            </BodyLayout>
          </ContentLayout>
        </Dialog.CustomContent>
        <Dialog.Actions>
          <FooterLayout>
            <StyledButton
              onClick={onDelete}
              disabled={selectedRows.length == 0}
            >
              Remove Mapping
            </StyledButton>
            <StyledButton onClick={onEdit} disabled={selectedRows.length != 1}>
              Edit
            </StyledButton>
            <StyledButton onClick={onClose}>Close</StyledButton>
          </FooterLayout>
        </Dialog.Actions>
      </Dialog>
    </>
  );
};

const DialogHeader = styled(Dialog.Header)<{ colors: Colors }>`
  hr {
    background-color: ${(props) => props.colors.interactive.disabledBorder};
  }
`;

const StyledAutocomplete = styled(Autocomplete)<{ colors: Colors }>`
  button {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  label {
    color: ${(props) => props.colors.text.staticTextLabel};
  }
  min-width: 25vw;
`;

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
`;

const HeaderLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 0.75rem;
`;

const ServerItemLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
`;

const BodyLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 50vh;
`;

const FooterLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 0.75rem;
`;

const StyledButton = styled(Button)<{ align?: string; isCompact?: boolean }>`
  &&& {
    ${({ align }) =>
      align === "right" ? `margin-left: auto;` : "margin: 0.5em;"};
  }

  ${({ isCompact }) =>
    !isCompact
      ? ""
      : css`
          & > span > svg {
            height: 10px !important;
          }
        `}
`;

export default WellboreUidMappingOverviewModal;
