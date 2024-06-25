import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import FluidContextMenu, {
  FluidContextMenuProps
} from "components/ContextMenus/FluidContextMenu";
import formatDateString from "components/DateFormatter";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import Fluid from "models/fluid";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import React from "react";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";

type FluidAsStrings = {
  [Property in keyof Fluid as Exclude<Property, "rheometers">]: string;
};

interface FluidsRow extends ContentTableRow, FluidAsStrings {
  fluid: Fluid;
}

export default function FluidsView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const { wellUid, wellboreUid, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { object: fluidsReport } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.FluidsReport,
    objectUid
  );

  const {
    components: fluids,
    isFetching,
    isFetched
  } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.Fluid,
    { placeholderData: [] }
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.FluidsReport);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedRows: FluidsRow[]
  ) => {
    const contextMenuProps: FluidContextMenuProps = {
      checkedFluids: checkedRows.map((row) => row.fluid),
      fluidsReport
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <FluidContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "type", label: "type", type: ContentType.String },
    {
      property: "locationSample",
      label: "locationSample",
      type: ContentType.String
    },
    { property: "dTim", label: "dTim", type: ContentType.DateTime },
    { property: "md", label: "md", type: ContentType.Measure },
    { property: "tvd", label: "tvd", type: ContentType.Measure },
    {
      property: "presBopRating",
      label: "presBopRating",
      type: ContentType.Measure
    },
    { property: "mudClass", label: "mudClass", type: ContentType.String },
    { property: "density", label: "density", type: ContentType.Measure },
    { property: "visFunnel", label: "visFunnel", type: ContentType.Measure },
    { property: "tempVis", label: "tempVis", type: ContentType.Measure },
    { property: "pv", label: "pv", type: ContentType.Measure },
    { property: "yp", label: "yp", type: ContentType.Measure },
    { property: "gel10Sec", label: "gel10Sec", type: ContentType.Measure },
    { property: "gel10Min", label: "gel10Min", type: ContentType.Measure },
    { property: "gel30Min", label: "gel30Min", type: ContentType.Measure },
    {
      property: "filterCakeLtlp",
      label: "filterCakeLtlp",
      type: ContentType.Measure
    },
    {
      property: "filtrateLtlp",
      label: "filtrateLtlp",
      type: ContentType.Measure
    },
    { property: "tempHthp", label: "tempHthp", type: ContentType.Measure },
    { property: "presHthp", label: "presHthp", type: ContentType.Measure },
    {
      property: "filtrateHthp",
      label: "filtrateHthp",
      type: ContentType.Measure
    },
    {
      property: "filterCakeHthp",
      label: "filterCakeHthp",
      type: ContentType.Measure
    },
    { property: "solidsPc", label: "solidsPc", type: ContentType.Measure },
    { property: "waterPc", label: "waterPc", type: ContentType.Measure },
    { property: "oilPc", label: "oilPc", type: ContentType.Measure },
    { property: "sandPc", label: "sandPc", type: ContentType.Measure },
    {
      property: "solidsLowGravPc",
      label: "solidsLowGravPc",
      type: ContentType.Measure
    },
    {
      property: "solidsCalcPc",
      label: "solidsCalcPc",
      type: ContentType.Measure
    },
    { property: "baritePc", label: "baritePc", type: ContentType.Measure },
    { property: "lcm", label: "lcm", type: ContentType.Measure },
    { property: "mbt", label: "mbt", type: ContentType.Measure },
    { property: "ph", label: "ph", type: ContentType.String },
    { property: "tempPh", label: "tempPh", type: ContentType.Measure },
    { property: "pm", label: "pm", type: ContentType.Measure },
    { property: "pmFiltrate", label: "pmFiltrate", type: ContentType.Measure },
    { property: "mf", label: "mf", type: ContentType.Measure },
    {
      property: "alkalinityP1",
      label: "alkalinityP1",
      type: ContentType.Measure
    },
    {
      property: "alkalinityP2",
      label: "alkalinityP2",
      type: ContentType.Measure
    },
    { property: "chloride", label: "chloride", type: ContentType.Measure },
    { property: "calcium", label: "calcium", type: ContentType.Measure },
    { property: "magnesium", label: "magnesium", type: ContentType.Measure },
    { property: "potassium", label: "potassium", type: ContentType.Measure },
    { property: "brinePc", label: "brinePc", type: ContentType.Measure },
    { property: "lime", label: "lime", type: ContentType.Measure },
    { property: "electStab", label: "electStab", type: ContentType.Measure },
    {
      property: "calciumChloride",
      label: "calciumChloride",
      type: ContentType.Measure
    },
    { property: "company", label: "company", type: ContentType.String },
    {
      property: "solidsHiGravPc",
      label: "solidsHiGravPc",
      type: ContentType.Measure
    },
    { property: "polymer", label: "polymer", type: ContentType.Measure },
    { property: "polyType", label: "polyType", type: ContentType.String },
    { property: "solCorPc", label: "solCorPc", type: ContentType.Measure },
    { property: "oilCtg", label: "oilCtg", type: ContentType.Measure },
    { property: "hardnessCa", label: "hardnessCa", type: ContentType.Measure },
    { property: "sulfide", label: "sulfide", type: ContentType.Measure },
    { property: "comments", label: "comments", type: ContentType.String }
  ];

  const fluidRows: FluidsRow[] = fluids.map((fluid) => {
    return {
      id: fluid.uid,
      uid: fluid.uid,
      type: fluid.type,
      locationSample: fluid.locationSample,
      dTim: formatDateString(fluid.dTim, timeZone, dateTimeFormat),
      md: measureToString(fluid.md),
      tvd: measureToString(fluid.tvd),
      presBopRating: measureToString(fluid.presBopRating),
      mudClass: fluid.mudClass,
      density: measureToString(fluid.density),
      visFunnel: measureToString(fluid.visFunnel),
      tempVis: measureToString(fluid.tempVis),
      pv: measureToString(fluid.pv),
      yp: measureToString(fluid.yp),
      gel10Sec: measureToString(fluid.gel10Sec),
      gel10Min: measureToString(fluid.gel10Min),
      gel30Min: measureToString(fluid.gel30Min),
      filterCakeLtlp: measureToString(fluid.filterCakeLtlp),
      filtrateLtlp: measureToString(fluid.filtrateLtlp),
      tempHthp: measureToString(fluid.tempHthp),
      presHthp: measureToString(fluid.presHthp),
      filtrateHthp: measureToString(fluid.filtrateHthp),
      filterCakeHthp: measureToString(fluid.filterCakeHthp),
      solidsPc: measureToString(fluid.solidsPc),
      waterPc: measureToString(fluid.waterPc),
      oilPc: measureToString(fluid.oilPc),
      sandPc: measureToString(fluid.sandPc),
      solidsLowGravPc: measureToString(fluid.solidsLowGravPc),
      solidsCalcPc: measureToString(fluid.solidsCalcPc),
      baritePc: measureToString(fluid.baritePc),
      lcm: measureToString(fluid.lcm),
      mbt: measureToString(fluid.mbt),
      ph: fluid.ph,
      tempPh: measureToString(fluid.tempPh),
      pm: measureToString(fluid.pm),
      pmFiltrate: measureToString(fluid.pmFiltrate),
      mf: measureToString(fluid.mf),
      alkalinityP1: measureToString(fluid.alkalinityP1),
      alkalinityP2: measureToString(fluid.alkalinityP2),
      chloride: measureToString(fluid.chloride),
      calcium: measureToString(fluid.calcium),
      magnesium: measureToString(fluid.magnesium),
      potassium: measureToString(fluid.potassium),
      brinePc: measureToString(fluid.brinePc),
      lime: measureToString(fluid.lime),
      electStab: measureToString(fluid.electStab),
      calciumChloride: measureToString(fluid.calciumChloride),
      company: fluid.company,
      solidsHiGravPc: measureToString(fluid.solidsHiGravPc),
      polymer: measureToString(fluid.polymer),
      polyType: fluid.polyType,
      solCorPc: measureToString(fluid.solCorPc),
      oilCtg: measureToString(fluid.oilCtg),
      hardnessCa: measureToString(fluid.hardnessCa),
      sulfide: measureToString(fluid.sulfide),
      comments: fluid.comments,
      inset: fluid.rheometers.map((rheometer) => {
        return {
          uid: rheometer.uid,
          tempRheom: measureToString(rheometer.tempRheom),
          presRheom: measureToString(rheometer.presRheom),
          vis3Rpm: rheometer.vis3Rpm,
          vis6Rpm: rheometer.vis6Rpm,
          vis100Rpm: rheometer.vis100Rpm,
          vis200Rpm: rheometer.vis200Rpm,
          vis300Rpm: rheometer.vis300Rpm,
          vis600Rpm: rheometer.vis600Rpm
        };
      }),
      fluid: fluid
    };
  });

  const insetColumns: ContentTableColumn[] = [
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "tempRheom", label: "tempRheom", type: ContentType.Measure },
    { property: "presRheom", label: "presRheom", type: ContentType.Measure },
    { property: "vis3Rpm", label: "vis3Rpm", type: ContentType.String },
    { property: "vis6Rpm", label: "vis6Rpm", type: ContentType.String },
    { property: "vis100Rpm", label: "vis100Rpm", type: ContentType.String },
    { property: "vis200Rpm", label: "vis200Rpm", type: ContentType.String },
    { property: "vis300Rpm", label: "vis300Rpm", type: ContentType.String },
    { property: "vis600Rpm", label: "vis600Rpm", type: ContentType.String }
  ];

  if (isFetched && !fluidsReport) {
    return <ItemNotFound itemType={ObjectType.FluidsReport} />;
  }

  return (
    <>
      {isFetching && (
        <ProgressSpinnerOverlay message={`Fetching FluidsReport.`} />
      )}
      <ContentTable
        viewId="fluidView"
        columns={columns}
        data={fluidRows}
        onContextMenu={onContextMenu}
        checkableRows
        insetColumns={insetColumns}
        showRefresh
        downloadToCsvFileName={`FluidsReport_${fluidsReport?.name}`}
      />
    </>
  );
}
