import React, { useMemo, useState } from "react";
import styled from "styled-components";
import ModalDialog, { ModalWidth } from "../ModalDialog.tsx";
import { Server } from "../../../models/server.ts";
import Wellbore from "../../../models/wellbore.tsx";
import OperationType from "../../../contexts/operationType.ts";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "../../ContentViews/table";
import { Typography } from "@equinor/eds-core-react";
import { getNameOccurrenceSuffix } from "../../../tools/logSameNamesHelper.tsx";
import formatDateString from "../../DateFormatter.ts";
import { LogObjectRow } from "../../ContentViews/LogsListView.tsx";
import { useGetMultipleObjects } from "../../../hooks/query/useGetObjects.tsx";
import { ObjectType } from "../../../models/objectType.ts";
import {
  GetMultiLogWizardStepModalAction,
  MultiLogWizardResult
} from "../../MultiLogUtils.tsx";
import { WITSML_INDEX_TYPE, WITSML_INDEX_TYPE_MD } from "../../Constants.tsx";

export interface SelectLogsStepModalProps {
  targetServer: Server;
  indexType: WITSML_INDEX_TYPE;
  wellbores: Wellbore[];
  onWizardFinish: (result?: MultiLogWizardResult) => void;
}

const SelectLogsStepModal = (
  props: SelectLogsStepModalProps
): React.ReactElement => {
  const { targetServer, indexType, wellbores, onWizardFinish } = props;
  const isDepthIndex = indexType == WITSML_INDEX_TYPE_MD;
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useOperationState();

  const allLogs = useGetMultipleObjects(
    wellbores.map((wb) => {
      return { server: targetServer, wellId: wb.wellUid, wellboreId: wb.uid };
    }),
    ObjectType.Log
  );

  const isFetching = useMemo(() => {
    return (
      !!allLogs && allLogs.length > 0 && allLogs.some((al) => al.isFetching)
    );
  }, [allLogs]);

  // const logs = allLogs?.filter(l => l.indexType === logType) ?? [];
  const logs = useMemo(() => {
    if (
      !!allLogs &&
      allLogs.length > 0 &&
      !allLogs.some((al) => al.isFetching)
    ) {
      return allLogs.flatMap((al) =>
        al.objects.filter((o) => o.indexType === indexType)
      );
    } else {
      return [];
    }
  }, [allLogs]);

  const [selectedRows, setSelectedRows] = useState([]);

  const onSubmit = async () => {
    const action = GetMultiLogWizardStepModalAction(
      {
        targetServer: targetServer,
        wellbores: wellbores,
        indexType: indexType,
        logObjects: selectedRows
      },
      onWizardFinish
    );
    dispatchOperation({ type: OperationType.HideModal });
    dispatchOperation(action);
  };

  const onCancel = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    onWizardFinish();
  };

  const columns: ContentTableColumn[] = [
    ...(wellbores.length > 1
      ? [
          {
            property: "wellName",
            label: "Well Name",
            type: ContentType.String
          },
          {
            property: "wellboreName",
            label: "Wellbore Name",
            type: ContentType.String
          }
        ]
      : []),
    { property: "name", label: "Name", type: ContentType.String },
    {
      property: "startIndex",
      label: "Start Index",
      type: isDepthIndex ? ContentType.Measure : ContentType.DateTime
    },
    {
      property: "endIndex",
      label: "End Index",
      type: isDepthIndex ? ContentType.Measure : ContentType.DateTime
    },
    { property: "mnemonics", label: "Mnemonics", type: ContentType.Number },
    {
      property: "serviceCompany",
      label: "Service Company",
      type: ContentType.String
    },
    { property: "runNumber", label: "Run Number", type: ContentType.String },
    { property: "indexType", label: "Index Type", type: ContentType.String },
    { property: "uid", label: "UID", type: ContentType.String },
    {
      property: "dTimCreation",
      label: "Created",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "Last Change",
      type: ContentType.DateTime
    }
  ];

  const getTableData = (): LogObjectRow[] => {
    const result = logs.map((log) => {
      return {
        ...log,
        id: log.uid,

        wellName: log.wellName,
        wellboreName: log.wellboreName,
        name: log.name + getNameOccurrenceSuffix(logs, log),
        startIndex: isDepthIndex
          ? log.startIndex
          : formatDateString(log.startIndex, timeZone, dateTimeFormat),
        endIndex: isDepthIndex
          ? log.endIndex
          : formatDateString(log.endIndex, timeZone, dateTimeFormat),
        dTimCreation: formatDateString(
          log.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          log.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        logObject: log
      };
    });
    return result.sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <>
      <ModalDialog
        heading={`MultiLog Wizard - Logs Selection Step`}
        confirmText={`Next`}
        content={
          <ContentLayout>
            <Typography>Select logs to add to log view:</Typography>
            <ContentTable
              columns={columns}
              data={getTableData()}
              onRowSelectionChange={(rows) =>
                setSelectedRows(rows as LogObjectRow[])
              }
              checkableRows={true}
              stickyLeftColumns={2}
            />
          </ContentLayout>
        }
        switchButtonPlaces={true}
        onSubmit={() => onSubmit()}
        onCancel={() => onCancel()}
        isLoading={isFetching}
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

export default SelectLogsStepModal;
