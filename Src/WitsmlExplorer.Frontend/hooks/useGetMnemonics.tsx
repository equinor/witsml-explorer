import { useConnectedServer } from "contexts/connectedServerContext";
import LogCurveInfo from "models/logCurveInfo";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NotificationService from "services/notificationService";

export function useGetMnemonics(
  isFethingLogCurveInfoList: boolean,
  logCurveInfoList: LogCurveInfo[],
  mnemonicsSearchParams: string,
  enableNotificationService?: boolean
) {
  const location = useLocation();
  const [mnemonics, setMnemonics] = useState<string[]>(null);
  const { connectedServer } = useConnectedServer();

  const updateMnemonics = (newMnemonics: string[]) => {
    if (JSON.stringify(newMnemonics) !== JSON.stringify(mnemonics)) {
      setMnemonics(newMnemonics);
    }
  };

  useEffect(() => {
    if (!isFethingLogCurveInfoList) {
      if (mnemonicsSearchParams) {
        const existingMnemonics = getExistingMnemonics(logCurveInfoList);
        const mnemonicsFromSearchParams = getMnemonicsFromSearchParams(
          mnemonicsSearchParams
        );
        const newMnemonics = mnemonicsFromSearchParams.filter((mnemonic) =>
          existingMnemonics.includes(mnemonic)
        );
        const missingMnemonics = getMissingMnemonics(
          mnemonicsFromSearchParams,
          existingMnemonics
        );
        if (
          missingMnemonics.length !== 0 &&
          missingMnemonics.length !== mnemonicsFromSearchParams.length &&
          enableNotificationService
        ) {
          sendMissingMnemonicsWarning(connectedServer.url, missingMnemonics);
        }
        updateMnemonics(newMnemonics);
      } else if (location?.state?.mnemonics) {
        updateMnemonics(JSON.parse(location.state.mnemonics));
      } else {
        updateMnemonics(getExistingMnemonics(logCurveInfoList));
      }
    }
  }, [
    isFethingLogCurveInfoList,
    mnemonicsSearchParams,
    logCurveInfoList,
    location?.state?.mnemonics
  ]);

  return { mnemonics, setMnemonics };
}

const getExistingMnemonics = (logCurveInfoList: LogCurveInfo[]) => {
  return logCurveInfoList.slice(1).map((logCurveInfo) => logCurveInfo.mnemonic); // slice(1) to skip index curve
};

const getMnemonicsFromSearchParams = (mnemonicsSearchParams: string) => {
  return JSON.parse(mnemonicsSearchParams) as string[];
};

const getMissingMnemonics = (
  mnemonicsFromSearchParams: string[],
  existingMnemonics: string[]
) => {
  return mnemonicsFromSearchParams.filter(
    (mnemonic) => !existingMnemonics.includes(mnemonic)
  );
};

const getMissingMnemonicsToString = (notExistingMnemonics: string[]) => {
  let notExistingMnemonicsString = "";
  notExistingMnemonics.forEach(
    (mnemonic) => (notExistingMnemonicsString += "'" + mnemonic + "' ")
  );
  return notExistingMnemonicsString;
};

const sendMissingMnemonicsWarning = (
  serverUrl: string,
  missingMnemonics: string[]
) => {
  const missingMnemonicsString = getMissingMnemonicsToString(missingMnemonics);
  NotificationService.Instance.alertDispatcher.dispatch({
    serverUrl: new URL(serverUrl),
    message: `Not all mnemonics from the URL's search parameters exist in this log. The following mnemonics are not included from the search parameters: ${missingMnemonicsString}`,
    isSuccess: false,
    severity: "warning"
  });
};
