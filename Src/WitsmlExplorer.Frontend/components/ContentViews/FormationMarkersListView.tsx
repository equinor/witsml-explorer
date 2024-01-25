import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import FormationMarkerContextMenu from "components/ContextMenus/FormationMarkerContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import formatDateString from "components/DateFormatter";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import FormationMarker from "models/formationMarker";
import { measureToString } from "models/measure";
import StratigraphicStruct from "models/stratigraphicStruct";
import React, { useContext, useEffect, useState } from "react";

export interface FormationMarkerRow extends ContentTableRow {
  formationMarker: FormationMarker;
}

export const FormationMarkersListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const [formationMarkers, setFormationMarkers] = useState<FormationMarker[]>(
    []
  );

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
    return formationMarkers.map((formationMarker) => {
      return {
        id: formationMarker.uid,
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
        chronostratigraphic: structToString(
          formationMarker.chronostratigraphic
        ),
        description: formationMarker.description,
        itemState: formationMarker.commonData.itemState,
        dTimCreation: formatDateString(
          formationMarker.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          formationMarker.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        formationMarker
      };
    });
  };

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedRows: FormationMarkerRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedRows.map((row) => row.formationMarker),
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <FormationMarkerContextMenu {...contextProps} />,
        position
      }
    });
  };

  return (
    Object.is(selectedWellbore?.formationMarkers, formationMarkers) && (
      <ContentTable
        viewId="formationMarkersListView"
        columns={columns}
        data={getTableData()}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName="FormationMarkers"
      />
    )
  );
};

const columns: ContentTableColumn[] = [
  { property: "name", label: "name", type: ContentType.String },
  { property: "itemState", label: "itemState", type: ContentType.String },
  { property: "mdPrognosed", label: "mdPrognosed", type: ContentType.Measure },
  {
    property: "tvdPrognosed",
    label: "tvdPrognosed",
    type: ContentType.Measure
  },
  { property: "mdTopSample", label: "mdTopSample", type: ContentType.Measure },
  {
    property: "tvdTopSample",
    label: "tvdTopSample",
    type: ContentType.Measure
  },
  {
    property: "thicknessBed",
    label: "thicknessBed",
    type: ContentType.Measure
  },
  {
    property: "thicknessApparent",
    label: "thicknessApparent",
    type: ContentType.Measure
  },
  {
    property: "thicknessPerpen",
    label: "thicknessPerpen",
    type: ContentType.Measure
  },
  { property: "mdLogSample", label: "mdLogSample", type: ContentType.Measure },
  {
    property: "tvdLogSample",
    label: "tvdLogSample",
    type: ContentType.Measure
  },
  { property: "dip", label: "dip", type: ContentType.Measure },
  {
    property: "dipDirection",
    label: "dipDirection",
    type: ContentType.Measure
  },
  {
    property: "lithostratigraphic",
    label: "lithostratigraphic",
    type: ContentType.String
  },
  {
    property: "chronostratigraphic",
    label: "chronostratigraphic",
    type: ContentType.String
  },
  { property: "description", label: "description", type: ContentType.String },
  {
    property: "dTimCreation",
    label: "commonData.dTimCreation",
    type: ContentType.DateTime
  },
  {
    property: "dTimLastChange",
    label: "commonData.dTimLastChange",
    type: ContentType.DateTime
  }
];

export default FormationMarkersListView;
