import ProgressSpinner from "../../ProgressSpinner.tsx";
import MultiLogSelectionService from "../../MultiLogSelectionService.tsx";
import { WITSML_INDEX_TYPE, WITSML_INDEX_TYPE_MD } from "../../Constants.tsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LogObject from "../../../models/logObject.tsx";
import { useGetServers } from "../../../hooks/query/useGetServers.tsx";
import {
  GetStartIndex,
  GetEndIndex,
  MultiLogSelectionCurveInfo,
  GetMultiLogWizardStepModalAction,
  MultiLogWizardParams
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

export default function MultiLogCurveSelectionView() {
  const { dispatchOperation } = useOperationState();
  const { dispatchLoggedInUsernames } = useLoggedInUsernames();
  const { servers } = useGetServers();

  const [multiLogSelectionCurveInfos, setMultiLogSelectionCurveInfos] =
    useState<MultiLogSelectionCurveInfo[]>([]);
  const authorizedMultiLogSelectionCurveInfosRef = useRef<
    MultiLogSelectionCurveInfo[]
  >([]);
  const [logCurveInfoRows, setLogCurveInfoRows] = useState<LogCurveInfoRow[]>(
    []
  );
  const [logObjects, setLogObjects] = useState<LogObject[]>([]);
  const [indexTypeValue, setIndexTypeValue] =
    useState<WITSML_INDEX_TYPE>(WITSML_INDEX_TYPE_MD);
  const [isDepthIndexValue, setIsDepthIndexValue] = useState<boolean>(true);
  const [startIndexValue, setStartIndexValue] = useState<string | number>(
    GetStartIndex(isDepthIndexValue, [])
  );
  const [endIndexValue, setEndIndexValue] = useState<string | number>(
    GetEndIndex(isDepthIndexValue, [])
  );
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(true);
  const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(true);
  const [isFetchedLogs, setIsFetchedLogs] = useState<boolean>(false);
  const [showValues, setShowValues] = useState<boolean>(false);

  const setupData = useCallback(
    async (curveInfos: MultiLogSelectionCurveInfo[]) => {
      setIsFetchedLogs(false);
      setIsFetchingLogs(true);

      if (curveInfos?.length > 0) {
        setIsAuthorizing(true);

        const checkedServers = new Map<string, boolean>();
        let curveInfosLeftToCheck = curveInfos.length;

        for (const curveInfo of curveInfos) {
          if (checkedServers.has(curveInfo.serverId)) {
            if (checkedServers.get(curveInfo.serverId)) {
              authorizedMultiLogSelectionCurveInfosRef.current.push(curveInfo);
            }
            if (--curveInfosLeftToCheck < 1) {
              setIsAuthorizing(false);
              setMultiLogSelectionCurveInfos(
                authorizedMultiLogSelectionCurveInfosRef.current
              );
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
                  AuthorizationService.onAuthorized(
                    serverToAuthorize,
                    username
                  );
                  dispatchLoggedInUsernames({
                    type: LoggedInUsernamesActionType.AddLoggedInUsername,
                    payload: { serverId: serverToAuthorize.id, username }
                  });
                  authorizedMultiLogSelectionCurveInfosRef.current.push(
                    curveInfo
                  );
                  checkedServers.set(serverToAuthorize.id, true);
                  if (--curveInfosLeftToCheck < 1) {
                    setIsAuthorizing(false);
                    setMultiLogSelectionCurveInfos(
                      authorizedMultiLogSelectionCurveInfosRef.current
                    );
                  }
                  finished = true;
                },
                onCancel: () => {
                  checkedServers.set(serverToAuthorize.id, false);
                  if (--curveInfosLeftToCheck < 1) {
                    setIsAuthorizing(false);
                    setMultiLogSelectionCurveInfos(
                      authorizedMultiLogSelectionCurveInfosRef.current
                    );
                  }
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
      } else {
        setIsAuthorizing(false);
        setMultiLogSelectionCurveInfos([]);
      }
    },
    [servers, isDepthIndexValue, indexTypeValue]
  );

  const logInfos = useMemo(() => {
    if (multiLogSelectionCurveInfos?.length > 0) {
      return multiLogSelectionCurveInfos
        .filter(
          (ci, idx) =>
            multiLogSelectionCurveInfos.findIndex(
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
    } else {
      return [];
    }
  }, [multiLogSelectionCurveInfos, isDepthIndexValue, indexTypeValue]);

  useEffect(() => {
    const unsubscribe =
      MultiLogSelectionService.Instance.onMultilogSelectionStorageUpdated.subscribe(
        (indexType: WITSML_INDEX_TYPE) => {
          setIndexTypeValue(indexType);
          setIsDepthIndexValue(indexType == WITSML_INDEX_TYPE_MD);
          const values =
            MultiLogSelectionService.Instance.getMultiLogValues(indexType);
          setupData(values?.curveInfos);
        }
      );

    return function cleanup() {
      unsubscribe();
    };
  }, [servers]);

  useEffect(() => {
    const values =
      MultiLogSelectionService.Instance.getMultiLogValues(indexTypeValue);
    if (!!servers && servers.length > 0) {
      setupData(values?.curveInfos);
    }
  }, [servers, indexTypeValue]);

  useEffect(() => {
    const getLogObjects = async () => {
      if (logInfos?.length > 0 && !isFetchedLogs) {
        setIsFetchingLogs(true);
        let los: LogObject[] = [];
        let fetchingCount = logInfos.length;
        for (const logInfo of logInfos) {
          const logObject = await ObjectService.getObject(
            logInfo.wellId,
            logInfo.wellboreId,
            logInfo.logId,
            ObjectType.Log,
            new AbortController().signal,
            logInfo.server
          );

          los = los.concat(logObject);

          if (--fetchingCount < 1) {
            setLogObjects(los);
            setIsFetchingLogs(false);
            setIsFetchedLogs(true);
          }
        }
      } else {
        setLogObjects([]);
        setIsFetchingLogs(false);
        setIsFetchedLogs(false);
      }
    };
    getLogObjects();
  }, [logInfos, multiLogSelectionCurveInfos]);

  const onAdd = () => {
    const action = GetMultiLogWizardStepModalAction(
      {
        indexType: indexTypeValue
      } as MultiLogWizardParams,
      (r) => {
        if (r?.curveInfos?.length > 0) {
          MultiLogSelectionService.Instance.addMultiLogValues(
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
          MultiLogSelectionService.Instance.removeAllMultiLogValues(
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
          MultiLogSelectionService.Instance.removeMultiLogValues(
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
          multiLogCurveInfos={logCurveInfoRows}
          logObjects={logObjects}
          logInfos={logInfos}
          isDepthIndex={isDepthIndexValue}
          startIndex={startIndexValue}
          endIndex={endIndexValue}
          onSelectMnemonics={onSelectMnemonics}
        />
      ) : (
        <MultiLogCurveSelectionList
          multiLogSelectionCurveInfos={multiLogSelectionCurveInfos}
          logInfos={logInfos}
          logObjects={logObjects}
          indexType={indexTypeValue}
          onIndexTypeChange={setIndexTypeValue}
          onAdd={onAdd}
          onRemoveAll={onRemoveAll}
          onRemoveSelected={onRemoveSelected}
          onShowValues={onShowValues}
        />
      )}
    </>
  );
}
