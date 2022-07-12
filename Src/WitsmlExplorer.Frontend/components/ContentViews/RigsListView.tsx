import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import Rig from "../../models/rig";
import NavigationContext from "../../contexts/navigationContext";

export const RigsListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore } = navigationState;
  const [rigs, setRigs] = useState<Rig[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.rigs) {
      setRigs(selectedWellbore.rigs);
    }
  }, []);
  const getTableData = () => {
    return rigs.map((rig) => {
      return {
        ...rig,
        id: rig.uid,
        ratingDrillDepth: `${rig.ratingDrillDepth?.value ?? ""} ${rig.ratingDrillDepth?.uom ?? ""}`,
        ratingWaterDepth: `${rig.ratingWaterDepth?.value ?? ""} ${rig.ratingWaterDepth?.uom ?? ""}`,
        airGap: `${rig.airGap?.value ?? ""} ${rig.airGap?.uom ?? ""}`,
        rig: rig
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "uid", label: "Uid", type: ContentType.String },
    { property: "owner", label: "Owner", type: ContentType.String },
    { property: "typeRig", label: "TypeRig", type: ContentType.String },
    { property: "manufacturer", label: "Manufacturer", type: ContentType.String },
    { property: "yearEntService", label: "YearEntService", type: ContentType.String },
    { property: "classRig", label: "ClassRig", type: ContentType.String },
    { property: "approvals", label: "Approvals", type: ContentType.String },
    { property: "registration", label: "Registration", type: ContentType.String },
    { property: "telNumber", label: "TelNumber", type: ContentType.String },
    { property: "faxNumber", label: "FaxNumber", type: ContentType.String },
    { property: "emailAddress", label: "EmailAddress", type: ContentType.String },
    { property: "nameContact", label: "NameContact", type: ContentType.String },
    { property: "ratingDrillDepth", label: "RatingDrillDepth", type: ContentType.String },
    { property: "ratingWaterDepth", label: "RatingWaterDepth", type: ContentType.String },
    { property: "isOffshore", label: "IsOffshore", type: ContentType.String },
    { property: "airGap", label: "AirGap", type: ContentType.String },
    { property: "dTimStartOp", label: "DateTimeStartOperating", type: ContentType.DateTime },
    { property: "dTimEndOp", label: "DateTimeEndOperating", type: ContentType.DateTime }
  ];

  return <ContentTable columns={columns} data={getTableData()} />;
};

export default RigsListView;
