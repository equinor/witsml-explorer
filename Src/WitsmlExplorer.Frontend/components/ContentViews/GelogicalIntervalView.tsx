import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import GeologyInterval from "../../models/geologyInterval";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";
import geologyintervalObject from "../../models/geologyLog";

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
  geologyInterval: GeologyInterval;
}

export const GelogicalIntervalView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedObject } = navigationState;
  const [gelogicalLithologies, setGelogicalLithologies] = useState<
    geologyintervalObject[] | undefined
  >(undefined);
  const selectedInterval = selectedObject as geologyintervalObject;

  useEffect(() => {
    if (!selectedInterval) return;

    const lithologiesKey = Object.keys(selectedInterval).find((key) =>
      Array.isArray(selectedInterval[key])
    );
    if (!lithologiesKey) return;

    const lithologyRows = selectedInterval[lithologiesKey].map(
      (lithology: geologyintervalObject) => ({
        id: lithology.uid,
        typeLithology: lithology.type,
        codeLith: lithology.codeLith,
        lithPc: lithology.lithPc
      })
    );

    setGelogicalLithologies(lithologyRows);
  }, [selectedInterval]);

  const columns: ContentTableColumn[] = [
    { property: "typeLithology", label: "type", type: ContentType.String },
    { property: "codeLith", label: "codeLith", type: ContentType.Number },
    { property: "lithPc", label: "lithPc %", type: ContentType.Number }
  ];

  return selectedInterval ? (
    <ContentTable
      viewId="GelogicalIntervalView"
      columns={columns}
      data={gelogicalLithologies ?? []}
      checkableRows
      showRefresh
      downloadToCsvFileName={`GelogicalIntervalView_${selectedInterval.typeLithology}`}
    />
  ) : (
    <></>
  );
};

export default GelogicalIntervalView;
