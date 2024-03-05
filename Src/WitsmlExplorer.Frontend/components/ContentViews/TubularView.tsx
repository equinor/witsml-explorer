import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import TubularComponentContextMenu, {
  TubularComponentContextMenuProps
} from "components/ContextMenus/TubularComponentContextMenu";
import ProgressSpinner from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { ComponentType } from "models/componentType";
import { ObjectType } from "models/objectType";
import TubularComponent from "models/tubularComponent";
import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";

export interface TubularComponentRow extends ContentTableRow {
  uid: string;
  sequence: number;
  typeTubularComponent: string;
  innerDiameter: number;
  od: number;
  len: number;
  tubularName: string;
  typeTubularAssy: string;
  tubularComponent: TubularComponent;
}

export default function TubularView() {
  const { dispatchOperation } = useContext(OperationContext);
  const { wellUid, wellboreUid, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { object: tubular, isFetched: isFetchedTubular } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Tubular,
    objectUid
  );

  const { components: tubularComponents, isFetching } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.TubularComponent,
    { placeholderData: [] }
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Tubular);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedTubularComponents: TubularComponentRow[]
  ) => {
    const contextMenuProps: TubularComponentContextMenuProps = {
      checkedTubularComponents,
      tubular
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <TubularComponentContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "sequence", label: "sequence", type: ContentType.Number },
    {
      property: "typeTubularComponent",
      label: "typeTubularComp",
      type: ContentType.String
    },
    { property: "innerDiameter", label: "id", type: ContentType.Measure },
    { property: "od", label: "od", type: ContentType.Measure },
    { property: "len", label: "len", type: ContentType.Measure },
    {
      property: "tubularName",
      label: "tubular.name",
      type: ContentType.String
    },
    {
      property: "typeTubularAssy",
      label: "tubular.typeTubularAssy",
      type: ContentType.String
    },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const tubularComponentRows = tubularComponents.map((tubularComponent) => {
    return {
      id: tubularComponent.uid,
      sequence: tubularComponent.sequence,
      typeTubularComponent: tubularComponent.typeTubularComponent,
      innerDiameter: `${tubularComponent.id?.value?.toFixed(4)} ${
        tubularComponent.id?.uom
      }`,
      od: `${tubularComponent.od?.value?.toFixed(4)} ${
        tubularComponent.od?.uom
      }`,
      len: `${tubularComponent.len?.value?.toFixed(4)} ${
        tubularComponent.len?.uom
      }`,
      tubularName: tubular?.name,
      typeTubularAssy: tubular?.typeTubularAssy,
      uid: tubularComponent.uid,
      tubularComponent: tubularComponent
    };
  });

  if (isFetching) {
    return <ProgressSpinner message={`Fetching Tubular.`} />;
  }

  if (isFetchedTubular && !tubular) {
    return <ItemNotFound itemType={ObjectType.Tubular} />;
  }

  return (
    <ContentTable
      viewId="tubularView"
      columns={columns}
      data={tubularComponentRows}
      onContextMenu={onContextMenu}
      checkableRows
      showRefresh
      downloadToCsvFileName={`Tubular_${tubular?.name}`}
    />
  );
}
