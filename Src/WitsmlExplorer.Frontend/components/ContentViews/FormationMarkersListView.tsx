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
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import FormationMarker from "models/formationMarker";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import StratigraphicStruct from "models/stratigraphicStruct";
import { MouseEvent } from "react";
import { useParams } from "react-router-dom";

export interface FormationMarkerRow extends ContentTableRow {
  formationMarker: FormationMarker;
}

export default function FormationMarkersListView() {
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useOperationState();
  const { dispatchOperation } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const { wellUid, wellboreUid } = useParams();
  const { objects: formationMarkers } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.FormationMarker
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.FormationMarker);

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
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedRows: FormationMarkerRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedRows.map((row) => row.formationMarker)
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
    formationMarkers && (
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
}

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
