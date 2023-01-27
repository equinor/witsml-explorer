import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import GeologyInterval from "../../models/geologyInterval";
import MudLogService from "../../services/mudLogService";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface GeologyIntervalRow extends ContentTableRow {
  uid: string;
}

export const MudLogView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedMudLog } = navigationState;
  const [geologyIntervals, setGeologyIntervals] = useState<GeologyInterval[]>([]);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedMudLog) {
      const abortController = new AbortController();

      const getGeologyIntervals = async () => {
        setGeologyIntervals(await MudLogService.getGeologyIntervals(selectedMudLog.wellUid, selectedMudLog.wellboreUid, selectedMudLog.uid, abortController.signal));
        setIsFetchingData(false);
      };

      getGeologyIntervals();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedMudLog]);

  const columns: ContentTableColumn[] = [{ property: "uid", label: "uid", type: ContentType.String }];

  const geologyIntervalRows = geologyIntervals.map((geologyInterval) => {
    return {
      id: geologyInterval.uid,
      uid: geologyInterval.uid
    };
  });

  return selectedMudLog && !isFetchingData ? <ContentTable columns={columns} data={geologyIntervalRows} /> : <></>;
};

export default MudLogView;
