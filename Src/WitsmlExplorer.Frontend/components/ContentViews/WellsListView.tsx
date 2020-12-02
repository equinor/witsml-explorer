import React, { useContext } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";

export const WellsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { filteredWells } = navigationState;

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "field", label: "Field", type: ContentType.String },
    { property: "operator", label: "Operator", type: ContentType.String },
    { property: "timeZone", label: "Time zone", type: ContentType.String },
    { property: "uid", label: "UID Well", type: ContentType.String },
    { property: "dateTimeCreation", label: "Creation date", type: ContentType.Date },
    { property: "dateTimeLastChange", label: "Last changed", type: ContentType.Date }
  ];

  const onSelect = (well: any) => {
    dispatchNavigation({ type: NavigationType.SelectWell, payload: { well, wellbores: well.wellbores } });
  };

  return <ContentTable columns={columns} data={filteredWells} onSelect={onSelect} />;
};

export default WellsListView;
