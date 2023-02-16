import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import GeologyInterval from "../../models/geologyInterval";
import { measureToString } from "../../models/measure";
import MudLogService from "../../services/mudLogService";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface GeologyIntervalRow extends ContentTableRow {
  typeLithology: string;
  description: string;
  mdTop: string;
  mdBottom: string;
  tvdTop: string;
  tvdBase: string;
  ropAv: string;
  wobAv: string;
  tqAv: string;
  currentAv: string;
  rpmAv: string;
  wtMudAv: string;
  ecdTdAv: string;
  dxcAv: string;
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

  const columns: ContentTableColumn[] = [
    { property: "typeLithology", label: "typeLithology", type: ContentType.String },
    { property: "description", label: "description", type: ContentType.String },
    { property: "mdTop", label: "mdTop", type: ContentType.String },
    { property: "mdBottom", label: "mdBottom", type: ContentType.String },
    { property: "tvdTop", label: "tvdTop", type: ContentType.String },
    { property: "tvdBase", label: "tvdBase", type: ContentType.String },
    { property: "ropAv", label: "ropAv", type: ContentType.String },
    { property: "wobAv", label: "wobAv", type: ContentType.String },
    { property: "tqAv", label: "tqAv", type: ContentType.String },
    { property: "currentAv", label: "currentAv", type: ContentType.String },
    { property: "rpmAv", label: "rpmAv", type: ContentType.String },
    { property: "wtMudAv", label: "wtMudAv", type: ContentType.String },
    { property: "ecdTdAv", label: "ecdTdAv", type: ContentType.String },
    { property: "dxcAv", label: "dxcAv", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const geologyIntervalRows: GeologyIntervalRow[] = geologyIntervals.map((geologyInterval, index) => {
    return {
      id: index,
      typeLithology: geologyInterval.typeLithology,
      description: geologyInterval.description,
      mdTop: measureToString(geologyInterval.mdTop),
      mdBottom: measureToString(geologyInterval.mdBottom),
      tvdTop: measureToString(geologyInterval.tvdTop),
      tvdBase: measureToString(geologyInterval.tvdBase),
      ropAv: measureToString(geologyInterval.ropAv),
      wobAv: measureToString(geologyInterval.wobAv),
      tqAv: measureToString(geologyInterval.tqAv),
      currentAv: measureToString(geologyInterval.currentAv),
      rpmAv: measureToString(geologyInterval.rpmAv),
      wtMudAv: measureToString(geologyInterval.wtMudAv),
      ecdTdAv: measureToString(geologyInterval.ecdTdAv),
      dxcAv: geologyInterval.dxcAv,
      uid: geologyInterval.uid
    };
  });

  return selectedMudLog && !isFetchingData ? <ContentTable columns={columns} data={geologyIntervalRows} /> : <></>;
};

export default MudLogView;
