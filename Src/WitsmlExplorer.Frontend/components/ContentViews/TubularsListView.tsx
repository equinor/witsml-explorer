import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import Tubular from "../../models/tubular";
import NavigationContext from "../../contexts/navigationContext";

export const TubularsListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {  selectedWellbore} = navigationState;
  const [tubulars, setTubulars] = useState<Tubular[]>([]);

  useEffect(() => {
    if (selectedWellbore?.tubulars) {
      setTubulars(selectedWellbore.tubulars);
    }
  }, [selectedWellbore?.tubulars]);

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Tubular name", type: ContentType.String },
    { property: "typeTubularAssy", label: "typeTubularAssy", type: ContentType.String },
    { property: "uid", label: "UID", type: ContentType.String }
  ];

  return selectedWellbore ? <ContentTable columns={columns} data={tubulars} /> : <></>;
};

export default TubularsListView;
