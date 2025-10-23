import ProgressSpinner from "../../ProgressSpinner.tsx";
import MultiLogSelectionRepository from "../../MultiLogSelectionRepository.tsx";
import {
  WITSML_INDEX_TYPE,
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "../../Constants.tsx";
import { useCallback, useEffect, useState } from "react";
import LogObject from "../../../models/logObject.tsx";
import { useGetServers } from "../../../hooks/query/useGetServers.tsx";
import {
  GetStartIndex,
  GetEndIndex,
  MultiLogSelectionCurveInfo,
  GetMultiLogWizardStepModalAction,
  MultiLogWizardParams,
  MultiLogMetadata
} from "../../MultiLogUtils.tsx";
import MultiLogCurveSelectionList from "./MultiLogCurveSelectionList.tsx";
import MultiLogCurveSelectionValues from "./MultiLogCurveSelectionValues.tsx";
import { ObjectType } from "../../../models/objectType.ts";
import ObjectService from "../../../services/objectService.tsx";
import { LogCurveInfoRow } from "../LogCurveInfoListViewUtils.tsx";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "../../Modals/UserCredentialsModal.tsx";
import OperationType from "../../../contexts/operationType.ts";
import AuthorizationService from "../../../services/authorizationService.ts";
import { LoggedInUsernamesActionType } from "../../../contexts/loggedInUsernamesReducer.tsx";
import { useOperationState } from "hooks/useOperationState.tsx";
import { useLoggedInUsernames } from "../../../contexts/loggedInUsernamesContext.tsx";
import IndexRangeSelectionModal, {
  IndexRangeSelectionModalProps
} from "../../Modals/IndexRangeSelectionModal.tsx";
import { DisplayModalAction } from "../../../contexts/operationStateReducer.tsx";
import ConfirmModal from "../../Modals/ConfirmModal.tsx";
import MultiLogCurveInfo from "../../../models/multilogCurveInfo.ts";
import { useConnectedServer } from "../../../contexts/connectedServerContext.tsx";
import { useParams } from "react-router-dom";
import { RouterLogType } from "../../../routes/routerConstants.ts";

export default function MultiLogCurveSelectionView() {
  const { dispatchOperation } = useOperationState();
  const { dispatchLoggedInUsernames } = useLoggedInUsernames();
  const { servers } = useGetServers();
  const { connectedServer } = useConnectedServer();
  const { logType } = useParams();

  const [multiLogSelectionCurveInfos, setMultiLogSelectionCurveInfos] =
    useState<MultiLogSelectionCurveInfo[]>([]);
  const [logCurveInfoRows, setLogCurveInfoRows] = useState<LogCurveInfoRow[]>(
    []
  );
  const [logObjects, setLogObjects] = useState<LogObject[]>([]);
  const [multiLogMetadatas, setMultiLogMetadatas] = useState<
    MultiLogMetadata[]
  >([]);
  const [indexTypeValue, setIndexTypeValue] = useState<WITSML_INDEX_TYPE>(
    logType
      ? logType === RouterLogType.DEPTH
        ? WITSML_INDEX_TYPE_MD
        : WITSML_INDEX_TYPE_DATE_TIME
      : WITSML_INDEX_TYPE_MD
  );
  const [isDepthIndexValue, setIsDepthIndexValue] = useState<boolean>(true);
  const [startIndexValue, setStartIndexValue] = useState<string | number>(
    GetStartIndex(isDepthIndexValue, [])
  );
  const [endIndexValue, setEndIndexValue] = useState<string | number>(
    GetEndIndex(isDepthIndexValue, [])
  );
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(true);
  const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(true);
  const [showValues, setShowValues] = useState<boolean>(false);

  const setupData = useCallback(
    async (indexType: WITSML_INDEX_TYPE) => {
      const multiLogValues =
        MultiLogSelectionRepository.Instance.getMultiLogValues(indexType);

      if (multiLogValues?.curveInfos?.length > 0) {
        const curveInfos: MultiLogSelectionCurveInfo[] =
          multiLogValues.curveInfos;

        setIsFetchingLogs(true);
        setIsAuthorizing(true);
        const authorizedCurveInfos =
          await getAuthorizedMultiLogSelectionCurveInfos(curveInfos);
        setIsAuthorizing(false);

        let newMultiLogMetadatas: MultiLogMetadata[] = [];
        let newLogObjects: LogObject[] = [];

        if (authorizedCurveInfos?.length > 0) {
          newMultiLogMetadatas = authorizedCurveInfos
            .filter(
              (ci, idx) =>
                curveInfos.findIndex(
                  (cii) =>
                    ci.serverId == cii.serverId &&
                    ci.wellId == cii.wellId &&
                    ci.wellboreId == cii.wellboreId &&
                    ci.logUid == cii.logUid
                ) === idx
            )
            .map((ci) => {
              return {
                server: servers.find((s) => s.id === ci.serverId),
                wellId: ci.wellId,
                wellboreId: ci.wellboreId,
                logId: ci.logUid
              };
            });

          if (newMultiLogMetadatas?.length > 0) {
            newLogObjects = await getLogObjects(newMultiLogMetadatas);
          }
        }
        setLoadedData(
          authorizedCurveInfos,
          newMultiLogMetadatas,
          newLogObjects
        );
      } else {
        setIsAuthorizing(false);
        setLoadedData([], [], []);
      }
    },
    [servers, isDepthIndexValue, indexTypeValue]
  );

  const setLoadedData = (
    newCurveInfos: MultiLogSelectionCurveInfo[],
    newMultiLogMetadatas: MultiLogMetadata[],
    newLogObjects: LogObject[]
  ) => {
    setMultiLogSelectionCurveInfos(newCurveInfos ?? []);
    setMultiLogMetadatas(newMultiLogMetadatas ?? []);
    setLogObjects(newLogObjects ?? []);
    setIsFetchingLogs(false);
  };

  const getAuthorizedMultiLogSelectionCurveInfos = async (
    curveInfos: MultiLogSelectionCurveInfo[]
  ) => {
    const result: MultiLogSelectionCurveInfo[] = [];
    const checkedServers = new Map<string, boolean>();

    if (connectedServer) {
      checkedServers.set(connectedServer.id, true);
    }

    for (const curveInfo of curveInfos) {
      if (checkedServers.has(curveInfo.serverId)) {
        if (checkedServers.get(curveInfo.serverId)) {
          result.push(curveInfo);
        }
      } else {
        const serverToAuthorize = servers.find(
          (s) => s.id === curveInfo.serverId
        );

        if (serverToAuthorize) {
          let finished = false;
          checkedServers.set(serverToAuthorize.id, false);

          const userCredentialsModalProps: UserCredentialsModalProps = {
            server: serverToAuthorize,
            onConnectionVerified: (username) => {
              dispatchOperation({ type: OperationType.HideModal });
              AuthorizationService.onAuthorized(serverToAuthorize, username);
              dispatchLoggedInUsernames({
                type: LoggedInUsernamesActionType.AddLoggedInUsername,
                payload: { serverId: serverToAuthorize.id, username }
              });
              result.push(curveInfo);
              checkedServers.set(serverToAuthorize.id, true);
              finished = true;
            },
            onCancel: () => {
              checkedServers.set(serverToAuthorize.id, false);
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
      }
    }

    return result;
  };

  const getLogObjects = async (multiLogMetadatas: MultiLogMetadata[]) => {
    const los: LogObject[] = [];
    for (const multiLogMetadata of multiLogMetadatas) {
      const logObject = await ObjectService.getObject(
        multiLogMetadata.wellId,
        multiLogMetadata.wellboreId,
        multiLogMetadata.logId,
        ObjectType.Log,
        new AbortController().signal,
        multiLogMetadata.server
      );
      if (logObject) {
        los.push(logObject);
      }
    }
    return los;
  };

  useEffect(() => {
    const unsubscribe =
      MultiLogSelectionRepository.Instance.onMultilogSelectionStorageUpdated.subscribe(
        (indexType: WITSML_INDEX_TYPE) => {
          setIndexTypeValue(indexType);
          setIsDepthIndexValue(indexType == WITSML_INDEX_TYPE_MD);
          setupData(indexType);
        }
      );
    return function cleanup() {
      unsubscribe();
    };
  }, [servers]);

  useEffect(() => {
    if (!!servers && servers.length > 0) {
      setupData(indexTypeValue);
    }
  }, [servers]);

  const onIndexTypeChange = (indexType: WITSML_INDEX_TYPE) => {
    setIndexTypeValue(indexType);
    setIsDepthIndexValue(indexType == WITSML_INDEX_TYPE_MD);
    setupData(indexType);
  };

  const onAdd = () => {
    const action = GetMultiLogWizardStepModalAction(
      {
        indexType: indexTypeValue
      } as MultiLogWizardParams,
      (r) => {
        if (r?.curveInfos?.length > 0) {
          MultiLogSelectionRepository.Instance.addMultiLogValues(
            r.indexType,
            r.curveInfos,
            true
          );
        }
      }
    );
    dispatchOperation(action);
  };

  const onRemoveAll = () => {
    const confirmation = (
      <ConfirmModal
        heading={"Remove all curves from view"}
        content={
          <span>Are you sure you want to remove all curves from the view?</span>
        }
        onConfirm={() => {
          dispatchOperation({ type: OperationType.HideModal });
          MultiLogSelectionRepository.Instance.removeAllMultiLogValues(
            indexTypeValue
          );
        }}
        confirmColor={"danger"}
        confirmText={"Remove"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: confirmation
    });
  };

  const onRemoveSelected = (selectedRows: LogCurveInfoRow[]) => {
    const confirmation = (
      <ConfirmModal
        heading={"Remove selected curves from view"}
        content={
          <span>
            Are you sure you want to remove selected curves from the view?
          </span>
        }
        onConfirm={() => {
          dispatchOperation({ type: OperationType.HideModal });
          const mlcis: MultiLogSelectionCurveInfo[] = selectedRows.map(
            (row: LogCurveInfoRow) => {
              return {
                serverId: servers.find(
                  (s) =>
                    s.url.toLowerCase() ===
                    (
                      row.logCurveInfo as MultiLogCurveInfo
                    ).serverUrl.toLowerCase()
                ).id,
                wellId: row.wellUid,
                wellboreId: row.wellboreUid,
                logUid: row.logUid,
                mnemonic: row.mnemonic
              } as MultiLogSelectionCurveInfo;
            }
          );
          MultiLogSelectionRepository.Instance.removeMultiLogValues(
            indexTypeValue,
            mlcis
          );
        }}
        confirmColor={"danger"}
        confirmText={"Remove"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: confirmation
    });
  };

  const onRefresh = () => {
    setupData(indexTypeValue);
  };

  const onShowValues = (selectedRows: LogCurveInfoRow[]) => {
    const props: IndexRangeSelectionModalProps = {
      isDepthIndex: isDepthIndexValue,
      startIndex: GetStartIndex(isDepthIndexValue, selectedRows),
      endIndex: GetEndIndex(isDepthIndexValue, selectedRows),
      onSubmitIndexRange: (startIndex, endIndex) => {
        setStartIndexValue(startIndex);
        setEndIndexValue(endIndex);
        setLogCurveInfoRows(selectedRows);
        setShowValues(true);
      }
    };

    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <IndexRangeSelectionModal {...props} />
    };
    dispatchOperation(action);
  };

  const onSelectMnemonics = () => {
    setShowValues(false);
  };

  return (
    <>
      {isAuthorizing ? (
        <ProgressSpinner message="Authorizing data" />
      ) : isFetchingLogs ? (
        <ProgressSpinner message="Fetching data" />
      ) : showValues ? (
        <MultiLogCurveSelectionValues
          multiLogCurveInfoRows={logCurveInfoRows}
          logObjects={logObjects}
          multiLogMetadatas={multiLogMetadatas}
          isDepthIndex={isDepthIndexValue}
          startIndex={startIndexValue}
          endIndex={endIndexValue}
          onSelectMnemonics={onSelectMnemonics}
        />
      ) : (
        <MultiLogCurveSelectionList
          multiLogSelectionCurveInfos={multiLogSelectionCurveInfos}
          multiLogMetadatas={multiLogMetadatas}
          logObjects={logObjects}
          indexType={indexTypeValue}
          onIndexTypeChange={onIndexTypeChange}
          onAdd={onAdd}
          onRemoveAll={onRemoveAll}
          onRefresh={onRefresh}
          onRemoveSelected={onRemoveSelected}
          onShowValues={onShowValues}
        />
      )}
    </>
  );
}
