import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import WbGeometryObject from "../../models/wbGeometry";

export interface WbGeometryObjectRow extends ContentTableRow, WbGeometryObject {
  wbGeometry: WbGeometryObject;
}

export const WbGeometrysListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore } = navigationState;
  const [wbGeometrys, setWbGeometrys] = useState<WbGeometryObject[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.wbGeometrys) {
      setWbGeometrys(selectedWellbore.wbGeometrys);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return wbGeometrys.map((wbGeometry) => {
      return {
        ...wbGeometry,
        ...wbGeometry.commonData,
        id: wbGeometry.uid,
        mdBottom: `${wbGeometry.mdBottom?.value?.toFixed(4) ?? ""} ${wbGeometry.mdBottom?.uom ?? ""}`,
        gapAir: `${wbGeometry.gapAir?.value?.toFixed(4) ?? ""} ${wbGeometry.gapAir?.uom ?? ""}`,
        depthWaterMean: `${wbGeometry.depthWaterMean?.value?.toFixed(4) ?? ""} ${wbGeometry.depthWaterMean?.uom ?? ""}`,
        wbGeometry: wbGeometry
      };
    });
  };

  const columns: ContentTableColumn[] = [{ property: "itemState", label: "Item State", type: ContentType.String }];
  return <ContentTable columns={columns} data={getTableData()} checkableRows />;
};
export default WbGeometrysListView;
