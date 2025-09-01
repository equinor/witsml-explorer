import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import ModalDialog, { ModalWidth } from "../ModalDialog.tsx";
import { Server } from "../../../models/server.ts";
import Wellbore from "../../../models/wellbore.tsx";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import OperationType from "../../../contexts/operationType.ts";
import { ContentTable } from "../../ContentViews/table";
import { Switch, Typography } from "@equinor/eds-core-react";
import {
  getColumns,
  getTableData
} from "../../ContentViews/LogCurveInfoListViewUtils.tsx";
import { CommonPanelContainer } from "../../StyledComponents/Container.tsx";
import { UserTheme } from "../../../contexts/operationStateReducer.tsx";
import { useCurveThreshold } from "../../../contexts/curveThresholdContext.tsx";
import { useGetMultipleLocalPrioritizedCurves } from "../../../hooks/query/useGetLocalPrioritizedCurves.tsx";
import { useGetUniversalPrioritizedCurves } from "../../../hooks/query/useGetUniversalPrioritizedCurves.tsx";
import {
  MultiLogSelectionCurveInfo,
  MultiLogWizardResult
} from "../../MultiLogUtils.tsx";
import LogObject from "../../../models/logObject.tsx";
import LogCurveInfo from "../../../models/logCurveInfo.ts";
import LogObjectService from "../../../services/logObjectService.tsx";
import { WITSML_INDEX_TYPE, WITSML_INDEX_TYPE_MD } from "../../Constants.tsx";
import { LogObjectRow } from "../../ContentViews/LogsListView.tsx";

export interface SelectCurvesStepModalProps {
  targetServer: Server;
  indexType: WITSML_INDEX_TYPE;
  wellbores: Wellbore[];
  logObjects: LogObject[];
  onWizardFinish: (result?: MultiLogWizardResult) => void;
}

const SelectCurvesStepModal = (
  props: SelectCurvesStepModalProps
): React.ReactElement => {
  const { targetServer, indexType, wellbores, logObjects, onWizardFinish } =
    props;
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat, theme }
  } = useOperationState();
  const { curveThreshold } = useCurveThreshold();
  const allLocalPrioritizedCurves = useGetMultipleLocalPrioritizedCurves(
    wellbores.map((wb) => {
      return { wellUid: wb.wellUid, wellboreUid: wb.uid };
    })
  );
  const {
    universalPrioritizedCurves,
    isFetching: isFetchingUniversalPrioritizedCurves
  } = useGetUniversalPrioritizedCurves({
    placeholderData: []
  });

  const isDepthIndex = indexType == WITSML_INDEX_TYPE_MD;

  const [hideEmptyMnemonics, setHideEmptyMnemonics] = useState<boolean>(false);
  const [showOnlyPrioritizedCurves, setShowOnlyPrioritizedCurves] =
    useState<boolean>(false);
  const [logCurveInfoList, setLogCurveInfoList] = useState<LogCurveInfo[]>([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(true);

  const isFetchingLocalPrioritizedCurves: boolean = useMemo(() => {
    return (
      !!allLocalPrioritizedCurves &&
      allLocalPrioritizedCurves.length > 0 &&
      allLocalPrioritizedCurves.some((al) => al.isFetching)
    );
  }, [allLocalPrioritizedCurves]);

  const allPrioritizedCurves: string[] = useMemo(() => {
    const result: string[] = [];
    if (
      !isFetchingUniversalPrioritizedCurves &&
      !!universalPrioritizedCurves &&
      universalPrioritizedCurves.length > 0
    ) {
      result.push(...universalPrioritizedCurves);
    }

    if (
      !isFetchingLocalPrioritizedCurves &&
      !!allLocalPrioritizedCurves &&
      allLocalPrioritizedCurves.length > 0
    ) {
      result.push(...allLocalPrioritizedCurves.flatMap((ac) => ac.objects));
    }
    return result;
  }, [isFetchingLocalPrioritizedCurves, isFetchingUniversalPrioritizedCurves]);

  const logObjectMap: Map<string, LogObject> = useMemo(() => {
    const result = new Map<string, LogObject>();
    if (!!logObjects && logObjects.length > 0) {
      logObjects.forEach((lo) => result.set(lo.uid, lo));
    }
    return result;
  }, [logObjects]);

  useEffect(() => {
    let fetchingCount = wellbores.length;
    for (const wellbore of wellbores) {
      const logs = logObjects.filter(
        (lo) => lo.wellboreUid == wellbore.uid && lo.wellUid == wellbore.wellUid
      );

      if (!!logs && logs.length > 0) {
        LogObjectService.getMultiLogsCurveInfo(
          wellbore.wellUid,
          wellbore.uid,
          logs.map((l) => l.uid),
          new AbortController().signal
        )
          .then((mnemonics) => {
            if (!!mnemonics && mnemonics.length > 0) {
              setLogCurveInfoList(logCurveInfoList.concat(...mnemonics));
            }
          })
          .finally(() => {
            fetchingCount--;
            if (fetchingCount < 1) setIsFetchingLogs(false);
          });
      } else {
        fetchingCount--;
      }
    }
  }, [logObjects]);

  const panelElements = [
    <CommonPanelContainer key="hideEmptyMnemonics">
      <Switch
        checked={hideEmptyMnemonics}
        onChange={() => setHideEmptyMnemonics(!hideEmptyMnemonics)}
        size={theme === UserTheme.Compact ? "small" : "default"}
      />
      <Typography>Hide Empty Curves</Typography>
    </CommonPanelContainer>,
    <CommonPanelContainer key="showPriority">
      <Switch
        checked={showOnlyPrioritizedCurves}
        disabled={
          allPrioritizedCurves.length === 0 && !showOnlyPrioritizedCurves
        }
        onChange={() =>
          setShowOnlyPrioritizedCurves(!showOnlyPrioritizedCurves)
        }
        size={theme === UserTheme.Compact ? "small" : "default"}
      />
      <Typography>Show Only Prioritized Curves</Typography>
    </CommonPanelContainer>
  ];

  const onSubmit = async () => {
    if (!!selectedRows && selectedRows.length > 0) {
      onWizardFinish({
        targetServer: targetServer,
        indexType: indexType,
        curveInfos: selectedRows.map((r) => {
          return {
            serverId: targetServer.id,
            wellId: r.wellUid,
            wellboreId: r.wellboreUid,
            logUid: r.logUid,
            mnemonic: r.mnemonic
          } as MultiLogSelectionCurveInfo;
        })
      } as MultiLogWizardResult);
    } else {
      onWizardFinish();
    }
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      <ModalDialog
        heading={`MultiLog Wizard - Curves Selection Step`}
        confirmText={`OK`}
        content={
          <ContentLayout>
            <Typography>Select mnemonics to add to log view:</Typography>
            <ContentTable
              panelElements={panelElements}
              columns={getColumns(
                isDepthIndex,
                showOnlyPrioritizedCurves,
                false,
                allPrioritizedCurves,
                logObjectMap,
                hideEmptyMnemonics
              )}
              data={getTableData(
                logObjects,
                logCurveInfoList,
                logObjectMap,
                undefined,
                timeZone,
                dateTimeFormat,
                curveThreshold,
                isDepthIndex
              )}
              onRowSelectionChange={(rows) =>
                setSelectedRows(rows as LogObjectRow[])
              }
              checkableRows={true}
              stickyLeftColumns={2}
            />
          </ContentLayout>
        }
        onSubmit={() => onSubmit()}
        isLoading={
          isFetchingUniversalPrioritizedCurves ||
          isFetchingLocalPrioritizedCurves ||
          isFetchingLogs
        }
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

export default SelectCurvesStepModal;
