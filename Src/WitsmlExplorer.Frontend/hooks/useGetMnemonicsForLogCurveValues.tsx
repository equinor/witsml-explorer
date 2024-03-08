import { useConnectedServer } from "contexts/connectedServerContext";
import LogCurveInfo from "models/logCurveInfo";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NotificationService from "services/notificationService";

export function useGetMnemonicsForLogCurveValues(
  isFethingLogCurveInfoList: boolean,
  logCurveInfoList: LogCurveInfo[],
  mnemonicsSearchParams: string,
  enableNotificationService?: boolean
) {
  const location = useLocation();
  const [mnemonics, setMnemonics] = useState<string[]>(null);
  const { connectedServer } = useConnectedServer();

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
        const notExistingMnemonicsFromSearchParams =
          getNotExistingMnemonicsFromSearchParams(
            mnemonicsFromSearchParams,
            existingMnemonics
          );
        if (
          notExistingMnemonicsFromSearchParams.length !== 0 &&
          notExistingMnemonicsFromSearchParams.length !==
            mnemonicsFromSearchParams.length &&
          enableNotificationService
        ) {
          const notExistingMnemonicsString = getNotExistingMnemonicsToString(
            notExistingMnemonicsFromSearchParams
          );
          NotificationService.Instance.alertDispatcher.dispatch({
            serverUrl: new URL(connectedServer.url),
            message: `Not all mnemonics from the URL's search parameters exist in this log. The following mnemonics are not included from the search parameters: ${notExistingMnemonicsString}`,
            isSuccess: false,
            severity: "warning"
          });
        }
        setMnemonics(newMnemonics);
      } else if (location?.state?.mnemonics) {
        setMnemonics(JSON.parse(location.state.mnemonics));
      } else {
        setMnemonics(getExistingMnemonics(logCurveInfoList));
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
  return logCurveInfoList.slice(1).map((logCurveInfo) => logCurveInfo.mnemonic); // splice(1) to skip index curve
};

const getMnemonicsFromSearchParams = (mnemonicsSearchParams: string) => {
  return JSON.parse(mnemonicsSearchParams) as string[];
};

const getNotExistingMnemonicsFromSearchParams = (
  mnemonicsFromSearchParams: string[],
  existingMnemonics: string[]
) => {
  return mnemonicsFromSearchParams.filter(
    (mnemonic) => !existingMnemonics.includes(mnemonic)
  );
};

const getNotExistingMnemonicsToString = (notExistingMnemonics: string[]) => {
  let notExistingMnemonicsString = "";
  notExistingMnemonics.forEach(
    (mnemonic) => (notExistingMnemonicsString += "'" + mnemonic + "' ")
  );
  return notExistingMnemonicsString;
};
