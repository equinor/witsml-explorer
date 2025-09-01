import ProgressSpinner from "../../ProgressSpinner.tsx";
import MultiLogSelectionService from "../../MultiLogSelectionService.tsx";
import {
  WITSML_INDEX_TYPE,
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "../../Constants.tsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LogObject from "../../../models/logObject.tsx";
import { useGetServers } from "../../../hooks/query/useGetServers.tsx";
import {
  GetStartIndex,
  GetEndIndex,
  MultiLogSelectionCurveInfo
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

export default function MultiLogCurveSelectionView() {
  const {
    //operationState: { timeZone, dateTimeFormat, theme },
    dispatchOperation
  } = useOperationState();
  const { dispatchLoggedInUsernames } = useLoggedInUsernames();
  const { servers } = useGetServers();
  // const { connectedServer } = useConnectedServer();

  const [multiLogSelectionCurveInfos, setMultiLogSelectionCurveInfos] =
    useState<MultiLogSelectionCurveInfo[]>([]);
  // const [authorizedMultiLogSelectionCurveInfos, setAuthorizedMultiLogSelectionCurveInfos] = useState<MultiLogSelectionCurveInfo[]>([]);
  const authorizedMultiLogSelectionCurveInfosRef = useRef<
    MultiLogSelectionCurveInfo[]
  >([]);
  const [logCurveInfoRows, setLogCurveInfoRows] = useState<LogCurveInfoRow[]>(
    []
  );
  // const [logInfos, setLogInfos] = useState<{ server: Server, wellId: string, wellboreId: string, logId: string }[]>([]);
  const [logObjects, setLogObjects] = useState<LogObject[]>([]);
  const [isDepthIndex, setIsDepthIndex] = useState<boolean>(true);
  const [startIndex, setStartIndex] = useState<string | number>(
    GetStartIndex(isDepthIndex, [])
  );
  const [endIndex, setEndIndex] = useState<string | number>(
    GetEndIndex(isDepthIndex, [])
  );
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(true);
  const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(true);
  const [isFetchedLogs, setIsFetchedLogs] = useState<boolean>(false);
  const [showValues, setShowValues] = useState<boolean>(false);

  const setupData = useCallback(
    async (curveInfos: MultiLogSelectionCurveInfo[]) => {
      if (curveInfos?.length > 0) {
        setIsAuthorizing(true);

        const checkedServers = new Map<string, boolean>();
        let curveInfosLeftToCheck = curveInfos.length;

        for (const curveInfo of curveInfos) {
          if (
            checkedServers.has(curveInfo.serverId) &&
            checkedServers.get(curveInfo.serverId)
          ) {
            authorizedMultiLogSelectionCurveInfosRef.current.push(curveInfo);
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
            let finished = false;
            if (serverToAuthorize) {
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
      }
    },
    [servers]
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
  }, [multiLogSelectionCurveInfos]);

  useEffect(() => {
    const unsubscribe =
      MultiLogSelectionService.Instance.onMultilogSelectionStorageUpdated.subscribe(
        (indexType: WITSML_INDEX_TYPE) => {
          setIsDepthIndex(indexType == WITSML_INDEX_TYPE_MD);
          const values =
            MultiLogSelectionService.Instance.getMultiLogValues(indexType);
          if (values?.curveInfos?.length > 0) {
            setupData(values.curveInfos);
          }
        }
      );

    return function cleanup() {
      unsubscribe();
    };
  }, [servers]);

  useEffect(() => {
    const values =
      MultiLogSelectionService.Instance.getMultiLogValues(WITSML_INDEX_TYPE_MD);
    if (!!servers && servers.length > 0 && values?.curveInfos?.length > 0) {
      setupData(values.curveInfos);
    }
  }, [servers]);

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

          fetchingCount--;
          if (fetchingCount < 1) {
            setLogObjects(los);
            setIsFetchingLogs(false);
            setIsFetchedLogs(true);
          }
        }
      }
    };
    getLogObjects();
  }, [logInfos]);

  const onRemoveAll = () => {
    MultiLogSelectionService.Instance.removeAllMultiLogValues(
      isDepthIndex ? WITSML_INDEX_TYPE_MD : WITSML_INDEX_TYPE_DATE_TIME
    );
  };

  const onRemoveSelected = () => {
    // MultiLogSelectionService.Instance
    //   .removeAllMultiLogValues(isDepthIndex ? WITSML_INDEX_TYPE_MD : WITSML_INDEX_TYPE_DATE_TIME);
  };

  const onShowValues = (selectedRows: LogCurveInfoRow[]) => {
    setLogCurveInfoRows(selectedRows);
    setShowValues(true);
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
      ) : (
        isFetchedLogs &&
        (showValues ? (
          <MultiLogCurveSelectionValues
            multiLogCurveInfos={logCurveInfoRows}
            logObjects={logObjects}
            logInfos={logInfos}
            startIndex={startIndex}
            endIndex={endIndex}
            onSelectMnemonics={onSelectMnemonics}
          />
        ) : (
          <MultiLogCurveSelectionList
            multiLogSelectionCurveInfos={multiLogSelectionCurveInfos}
            logInfos={logInfos}
            logObjects={logObjects}
            isDepthIndex={isDepthIndex}
            // logCurveInfoRows={logCurveInfoRows}
            onStartIndexChange={setStartIndex}
            onEndIndexChange={setEndIndex}
            // onValidChange={setIsValid}
            onRemoveAll={onRemoveAll}
            onRemoveSelected={onRemoveSelected}
            onShowValues={onShowValues}
          />
        ))
      )}
    </>
  );
}
