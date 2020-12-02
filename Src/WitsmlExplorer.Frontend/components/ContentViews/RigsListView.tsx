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

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "airGap", label: "AirGap", type: ContentType.Number },
    { property: "owner", label: "Owner", type: ContentType.String },
    { property: "typeRig", label: "TypeRig", type: ContentType.String }
  ];

  return <ContentTable columns={columns} data={rigs} />;
};

export default RigsListView;
