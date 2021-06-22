import React, { useContext } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { calculateLogGroupId, calculateMessageGroupId, calculateRigGroupId, calculateTrajectoryGroupId } from "../../models/wellbore";

export const WellboreObjectTypesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore } = navigationState;

  const columns: ContentTableColumn[] = [{ property: "name", label: "Name", type: ContentType.String }];

  const getObjectTypes = () => {
    return [
      {
        uid: 1,
        name: "Logs",
        action: NavigationType.SelectLogGroup,
        actionPayload: { well: selectedWell, wellbore: selectedWellbore, logGroup: calculateLogGroupId(selectedWellbore) }
      },
      {
        uid: 2,
        name: "Rigs",
        action: NavigationType.SelectRigGroup,
        actionPayload: { well: selectedWell, wellbore: selectedWellbore, rigGroup: calculateRigGroupId(selectedWellbore) }
      },
      {
        uid: 3,
        name: "Trajectories",
        action: NavigationType.SelectTrajectoryGroup,
        actionPayload: { well: selectedWell, wellbore: selectedWellbore, trajectoryGroup: calculateTrajectoryGroupId(selectedWellbore) }
      },
      {
        uid: 4,
        name: "Messages",
        action: NavigationType.SelectMessageGroup,
        actionPayload: { well: selectedWell, wellbore: selectedWellbore, messageGroup: calculateMessageGroupId(selectedWellbore) }
      }
    ];
  };

  const onSelect = async (objectType: any) => {
    dispatchNavigation({ type: objectType.action, payload: { ...objectType.actionPayload, well: selectedWell, wellbore: selectedWellbore } });
  };

  return selectedWellbore ? <ContentTable columns={columns} data={getObjectTypes()} onSelect={onSelect} /> : <></>;
};

export default WellboreObjectTypesListView;
