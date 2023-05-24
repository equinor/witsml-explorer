import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import FormationMarker from "../../models/formationMarker";
import { measureToString } from "../../models/measure";
import StratigraphicStruct from "../../models/stratigraphicStruct";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import FormationMarkerContextMenu from "../ContextMenus/FormationMarkerContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface FormationMarkerRow extends ContentTableRow {
  formationMarker: FormationMarker;
}

export const FormationMarkersListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const [formationMarkers, setFormationMarkers] = useState<FormationMarker[]>([]);

  useEffect(() => {
    if (selectedWellbore?.formationMarkers) {
      setFormationMarkers(selectedWellbore.formationMarkers);
    }
  }, [selectedWellbore]);

  const structToString = (struct: StratigraphicStruct) => {
    if (struct == null) {
      return "";
    }
    return (struct.value ?? "") + " " + (struct.kind ?? "");
  };

  const getTableData = (): FormationMarkerRow[] => {
    return formationMarkers.map((formationMarker, index) => {
      return {
        id: index,
        name: formationMarker.name,
        mdPrognosed: measureToString(formationMarker.mdPrognosed),
        tvdPrognosed: measureToString(formationMarker.tvdPrognosed),
        mdTopSample: measureToString(formationMarker.mdTopSample),
        tvdTopSample: measureToString(formationMarker.tvdTopSample),
        thicknessBed: measureToString(formationMarker.thicknessBed),
        thicknessApparent: measureToString(formationMarker.thicknessApparent),
        thicknessPerpen: measureToString(formationMarker.thicknessPerpen),
        mdLogSample: measureToString(formationMarker.mdLogSample),
        tvdLogSample: measureToString(formationMarker.tvdLogSample),
        dip: measureToString(formationMarker.dip),
        dipDirection: measureToString(formationMarker.dipDirection),
        lithostratigraphic: structToString(formationMarker.lithostratigraphic),
        chronostratigraphic: structToString(formationMarker.chronostratigraphic),
        description: formationMarker.description,
        itemState: formationMarker.commonData.itemState,
        dTimCreation: formatDateString(formationMarker.commonData.dTimCreation, timeZone),
        dTimLastChange: formatDateString(formationMarker.commonData.dTimLastChange, timeZone),
        formationMarker
      };
    });
  };

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedRows: FormationMarkerRow[]) => {
    const contextProps: ObjectContextMenuProps = { checkedObjects: checkedRows.map((row) => row.formationMarker), wellbore: selectedWellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <FormationMarkerContextMenu {...contextProps} />, position } });
  };

  return Object.is(selectedWellbore?.formationMarkers, formationMarkers) && <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows />;
};

const columns: ContentTableColumn[] = [
  { property: "name", label: "name", type: ContentType.String },
  { property: "itemState", label: "itemState", type: ContentType.String },
  { property: "mdPrognosed", label: "mdPrognosed", type: ContentType.String },
  { property: "tvdPrognosed", label: "tvdPrognosed", type: ContentType.String },
  { property: "mdTopSample", label: "mdTopSample", type: ContentType.String },
  { property: "tvdTopSample", label: "tvdTopSample", type: ContentType.String },
  { property: "thicknessBed", label: "thicknessBed", type: ContentType.String },
  { property: "thicknessApparent", label: "thicknessApparent", type: ContentType.String },
  { property: "thicknessPerpen", label: "thicknessPerpen", type: ContentType.String },
  { property: "mdLogSample", label: "mdLogSample", type: ContentType.String },
  { property: "tvdLogSample", label: "tvdLogSample", type: ContentType.String },
  { property: "dip", label: "dip", type: ContentType.String },
  { property: "dipDirection", label: "dipDirection", type: ContentType.String },
  { property: "lithostratigraphic", label: "lithostratigraphic", type: ContentType.String },
  { property: "chronostratigraphic", label: "chronostratigraphic", type: ContentType.String },
  { property: "description", label: "description", type: ContentType.String },
  { property: "dTimCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
  { property: "dTimLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime }
];

export default FormationMarkersListView;
