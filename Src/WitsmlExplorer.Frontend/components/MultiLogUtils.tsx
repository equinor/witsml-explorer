import Wellbore from "../models/wellbore.tsx";
import { Server } from "../models/server.ts";
import Well from "../models/well.tsx";
import LogObject from "../models/logObject.tsx";
import { WITSML_INDEX_TYPE } from "./Constants.tsx";
import { DisplayModalAction } from "../contexts/operationStateReducer.tsx";
import SelectCurvesStepModal, {
  SelectCurvesStepModalProps
} from "./Modals/MultiLogCurveSelection/SelectCurvesStepModal.tsx";
import OperationType from "../contexts/operationType.ts";
import SelectLogsStepModal, {
  SelectLogsStepModalProps
} from "./Modals/MultiLogCurveSelection/SelectLogsStepModal.tsx";
import SelectWellboreStepModal, {
  SelectWellboreStepModalProps
} from "./Modals/MultiLogCurveSelection/SelectWellboreStepModal.tsx";
import { LogCurveInfoRow } from "./ContentViews/LogCurveInfoListViewUtils.tsx";
import MultiLogCurveInfo from "../models/multilogCurveInfo.ts";

export interface MultiLogMetadata {
  server: Server;
  wellId: string;
  wellboreId: string;
  logId: string;
}

export interface MultiLogSelectionValues {
  curveInfos: MultiLogSelectionCurveInfo[];
}

export interface MultiLogSelectionCurveInfo {
  serverId: string;
  wellId: string;
  wellboreId: string;
  logUid: string;
  mnemonic: string;
}

export interface MultiLogWizardParams {
  targetServer?: Server;
  indexType?: WITSML_INDEX_TYPE;
  well?: Well;
  wellbores?: Wellbore[];
  logObjects?: LogObject[];
}

export interface MultiLogWizardResult {
  targetServer: Server;
  indexType: WITSML_INDEX_TYPE;
  curveInfos: MultiLogSelectionCurveInfo[];
}

export interface MultiLogCurveInfoViewData extends MultiLogCurveInfo {
  serverName?: string;
}

export function GetMultiLogWizardStepModalAction(
  params: MultiLogWizardParams,
  onWizardFinish: (result?: MultiLogWizardResult) => void
): DisplayModalAction {
  if (
    !!params &&
    !!params.indexType &&
    !!params.targetServer &&
    !!params.wellbores &&
    params.wellbores.length > 0
  ) {
    if (!!params.logObjects && params.logObjects.length > 0) {
      const props = {
        indexType: params.indexType,
        targetServer: params.targetServer,
        wellbores: params.wellbores,
        logObjects: params.logObjects,
        onWizardFinish
      } as SelectCurvesStepModalProps;
      return {
        type: OperationType.DisplayModal,
        payload: <SelectCurvesStepModal {...props} />
      };
    } else {
      const props = {
        indexType: params.indexType,
        targetServer: params.targetServer,
        wellbores: params.wellbores,
        onWizardFinish
      } as SelectLogsStepModalProps;
      return {
        type: OperationType.DisplayModal,
        payload: <SelectLogsStepModal {...props} />
      };
    }
  } else {
    const props = {
      indexType: params.indexType,
      targetServer: params.targetServer,
      well: params.well,
      preselectedWellbores: params.wellbores,
      onWizardFinish
    } as SelectWellboreStepModalProps;
    return {
      type: OperationType.DisplayModal,
      payload: <SelectWellboreStepModal {...props} />
    };
  }
}

export function GetStartIndex(
  isDepthIndex: boolean,
  logCurveInfoRows: LogCurveInfoRow[]
): string | number {
  if (!logCurveInfoRows || logCurveInfoRows?.length == 0)
    return isDepthIndex ? 0 : "";
  if (isDepthIndex) {
    const min = Math.min(
      ...logCurveInfoRows.map((lci) =>
        lci.minIndex === null ? Infinity : (lci.minIndex as number)
      )
    );
    return min === Infinity ? 0 : min;
  } else {
    return (
      logCurveInfoRows
        .reduce((minRow, currentRow) => {
          if (minRow.minIndex === null) return currentRow;
          if (currentRow.minIndex === null) return minRow;
          return new Date(currentRow.minIndex) < new Date(minRow.minIndex)
            ? currentRow
            : minRow;
        })
        .minIndex?.toString() ?? ""
    );
  }
}

export function GetEndIndex(
  isDepthIndex: boolean,
  logCurveInfoRows: LogCurveInfoRow[]
): string | number {
  if (!logCurveInfoRows || logCurveInfoRows?.length == 0)
    return isDepthIndex ? 20000 : "";
  if (isDepthIndex) {
    return Math.max(...logCurveInfoRows.map((lci) => lci.maxIndex as number));
  } else {
    return (
      logCurveInfoRows
        .reduce((maxRow, currentRow) =>
          new Date(currentRow.maxIndex) > new Date(maxRow.maxIndex)
            ? currentRow
            : maxRow
        )
        .maxIndex?.toString() ?? ""
    );
  }
}
