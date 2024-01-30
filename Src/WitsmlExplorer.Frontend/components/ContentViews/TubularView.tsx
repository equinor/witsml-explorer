import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useExpandObjectsGroupNodes } from "../../hooks/useExpandObjectGroupNodes";
import { useGetObjectComponents } from "../../hooks/useGetObjectComponents";
import { ComponentType } from "../../models/componentType";
import { ObjectType } from "../../models/objectType";
import Tubular from "../../models/tubular";
import TubularComponent from "../../models/tubularComponent";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import TubularComponentContextMenu, {
  TubularComponentContextMenuProps
} from "../ContextMenus/TubularComponentContextMenu";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

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
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, selectedObject, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const selectedTubular = selectedObject as Tubular;
  const { wellUid, wellboreUid, objectUid } = useParams();

  const [tubularComponents, isFetching] =
    useGetObjectComponents<TubularComponent>(
      wellUid,
      wellboreUid,
      objectUid,
      ComponentType.TubularComponent
    );

  useExpandObjectsGroupNodes(wellUid, wellboreUid, ObjectType.Tubular);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedTubularComponents: TubularComponentRow[]
  ) => {
    const contextMenuProps: TubularComponentContextMenuProps = {
      checkedTubularComponents,
      dispatchNavigation,
      dispatchOperation,
      tubular: selectedTubular,
      selectedServer,
      servers
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
      tubularName: selectedTubular?.name,
      typeTubularAssy: selectedTubular?.typeTubularAssy,
      uid: tubularComponent.uid,
      tubularComponent: tubularComponent
    };
  });

  return (
    !isFetching && (
      <ContentTable
        viewId="tubularView"
        columns={columns}
        data={tubularComponentRows}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        // TODO: Fix selectedTubular.name
        downloadToCsvFileName={`Tubular_${objectUid}`}
      />
    )
  );
}
