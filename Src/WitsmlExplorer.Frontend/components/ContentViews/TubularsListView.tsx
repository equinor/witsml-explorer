import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import Tubular from "../../models/tubular";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";

export const TubularsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore, selectedTubularGroup } = navigationState;
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

  const onSelect = (tubular: any) => {
    dispatchNavigation({
      type: NavigationType.SelectTubular,
      payload: { well: selectedWell, wellbore: selectedWellbore, tubularGroup: selectedTubularGroup, tubular }
    });
  };

  return selectedWellbore ? <ContentTable columns={columns} data={tubulars} onSelect={onSelect} /> : <></>;
};

export default TubularsListView;
