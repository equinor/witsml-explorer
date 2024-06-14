import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import GeologyIntervalContextMenu, {
  GeologyIntervalContextMenuProps
} from "components/ContextMenus/GeologyIntervalContextMenu";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import GeologyInterval from "models/geologyInterval";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import React from "react";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";

export interface GeologyIntervalRow extends ContentTableRow {
  typeLithology: string;
  description: string;
  mdTop: string;
  mdBottom: string;
  tvdTop: string;
  tvdBase: string;
  ropAv: string;
  wobAv: string;
  tqAv: string;
  currentAv: string;
  rpmAv: string;
  wtMudAv: string;
  ecdTdAv: string;
  dxcAv: string;
  uid: string;
  geologyInterval: GeologyInterval;
}

export default function MudLogView() {
  const { dispatchOperation } = useOperationState();
  const { wellUid, wellboreUid, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { object: mudLog, isFetched: isFetchedMudLog } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.MudLog,
    objectUid
  );

  const { components: geologyIntervals, isFetching } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.GeologyInterval,
    { placeholderData: [] }
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.MudLog);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedRows: GeologyIntervalRow[]
  ) => {
    const contextMenuProps: GeologyIntervalContextMenuProps = {
      checkedGeologyIntervals: checkedRows.map((row) => row.geologyInterval),
      mudLog
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <GeologyIntervalContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const columns: ContentTableColumn[] = [
    {
      property: "typeLithology",
      label: "typeLithology",
      type: ContentType.String
    },
    { property: "description", label: "description", type: ContentType.String },
    { property: "mdTop", label: "mdTop", type: ContentType.Measure },
    { property: "mdBottom", label: "mdBottom", type: ContentType.Measure },
    { property: "tvdTop", label: "tvdTop", type: ContentType.Measure },
    { property: "tvdBase", label: "tvdBase", type: ContentType.Measure },
    { property: "ropAv", label: "ropAv", type: ContentType.Measure },
    { property: "wobAv", label: "wobAv", type: ContentType.Measure },
    { property: "tqAv", label: "tqAv", type: ContentType.Measure },
    { property: "currentAv", label: "currentAv", type: ContentType.Measure },
    { property: "rpmAv", label: "rpmAv", type: ContentType.Measure },
    { property: "wtMudAv", label: "wtMudAv", type: ContentType.Measure },
    { property: "ecdTdAv", label: "ecdTdAv", type: ContentType.Measure },
    { property: "dxcAv", label: "dxcAv", type: ContentType.Number },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const geologyIntervalRows: GeologyIntervalRow[] = geologyIntervals.map(
    (geologyInterval) => {
      return {
        id: geologyInterval.uid,
        typeLithology: geologyInterval.typeLithology,
        description: geologyInterval.description,
        mdTop: measureToString(geologyInterval.mdTop),
        mdBottom: measureToString(geologyInterval.mdBottom),
        tvdTop: measureToString(geologyInterval.tvdTop),
        tvdBase: measureToString(geologyInterval.tvdBase),
        ropAv: measureToString(geologyInterval.ropAv),
        wobAv: measureToString(geologyInterval.wobAv),
        tqAv: measureToString(geologyInterval.tqAv),
        currentAv: measureToString(geologyInterval.currentAv),
        rpmAv: measureToString(geologyInterval.rpmAv),
        wtMudAv: measureToString(geologyInterval.wtMudAv),
        ecdTdAv: measureToString(geologyInterval.ecdTdAv),
        dxcAv: geologyInterval.dxcAv,
        uid: geologyInterval.uid,
        inset: geologyInterval.lithologies.map((lithology) => {
          return {
            id: lithology.uid,
            type: lithology.type,
            codeLith: lithology.codeLith,
            lithPc: lithology.lithPc
          };
        }),
        geologyInterval
      };
    }
  );

  if (isFetchedMudLog && !mudLog) {
    return <ItemNotFound itemType={ObjectType.MudLog} />;
  }

  return (
    <>
      {isFetching && <ProgressSpinnerOverlay message="Fetching MudLog." />}
      <ContentTable
        viewId="mudLogView"
        columns={columns}
        data={geologyIntervalRows}
        onContextMenu={onContextMenu}
        checkableRows
        insetColumns={insetColumns}
        showRefresh
        downloadToCsvFileName={`MudLog_${mudLog?.name}`}
      />
    </>
  );
}

const insetColumns: ContentTableColumn[] = [
  { property: "type", label: "type", type: ContentType.String },
  { property: "codeLith", label: "codeLith", type: ContentType.Number },
  { property: "lithPc", label: "lithPc %", type: ContentType.Number }
];
