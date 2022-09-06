import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import {
  calculateBhaRunGroupId,
  calculateLogGroupId,
  calculateMessageGroupId,
  calculateRigGroupId,
  calculateRiskGroupId,
  calculateTrajectoryGroupId,
  calculateTubularGroupId,
  calculateWbGeometryGroupId
} from "../../models/wellbore";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

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
      },
      {
        uid: 5,
        name: "Tubulars",
        action: NavigationType.SelectTubularGroup,
        actionPayload: { well: selectedWell, wellbore: selectedWellbore, tubularGroup: calculateTubularGroupId(selectedWellbore) }
      },
      {
        uid: 6,
        name: "Risks",
        action: NavigationType.SelectRiskGroup,
        actionPayload: { well: selectedWell, wellbore: selectedWellbore, riskGroup: calculateRiskGroupId(selectedWellbore) }
      },
      {
        uid: 7,
        name: "WbGeometries",
        action: NavigationType.SelectWbGeometryGroup,
        actionPayload: { well: selectedWell, wellbore: selectedWellbore, wbGeometryGroup: calculateWbGeometryGroupId(selectedWellbore) }
      },
      {
        uid: 8,
        name: "BhaRuns",
        action: NavigationType.SelectBhaRunGroup,
        actionPayload: { well: selectedWell, wellbore: selectedWellbore, bhaRunGroup: calculateBhaRunGroupId(selectedWellbore) }
      }
    ];
  };

  const onSelect = async (objectType: any) => {
    dispatchNavigation({ type: objectType.action, payload: { ...objectType.actionPayload, well: selectedWell, wellbore: selectedWellbore } });
  };

  return selectedWellbore ? <ContentTable columns={columns} data={getObjectTypes()} onSelect={onSelect} /> : <></>;
};

export default WellboreObjectTypesListView;
