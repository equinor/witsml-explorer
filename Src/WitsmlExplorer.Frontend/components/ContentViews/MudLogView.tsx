import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import MudLogComponent from "../../models/mudLogGeologyInterval";
import MudLogService from "../../services/mudLogService";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface MudLogGeologyIntervalRow extends ContentTableRow {
  uid: string;
}

export const MudLogView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedMudLog } = navigationState;
  const [mudLogGeologyInterval, setMudLogGeologyInterval] = useState<MudLogComponent[]>([]);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedMudLog) {
      const abortController = new AbortController();

      const getMudLogGeologyInterval = async () => {
        setMudLogGeologyInterval(await MudLogService.getGeologyIntervals(selectedMudLog.wellUid, selectedMudLog.wellboreUid, selectedMudLog.uid, abortController.signal));
        setIsFetchingData(false);
      };

      getMudLogGeologyInterval();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedMudLog]);

  const columns: ContentTableColumn[] = [{ property: "uid", label: "uid", type: ContentType.String }];

  const mudLogGeologyIntervalRows = mudLogGeologyInterval.map((mudLogGeologyInterval) => {
    return {
      id: mudLogGeologyInterval.uid,
      uid: mudLogGeologyInterval.uid
    };
  });

  return selectedMudLog && !isFetchingData ? <ContentTable columns={columns} data={mudLogGeologyIntervalRows} /> : <></>;
};

export default MudLogView;
