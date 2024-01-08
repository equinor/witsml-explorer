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
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";
import Tubular from "models/tubular";
import TubularComponent from "models/tubularComponent";
import React, { useContext, useEffect, useState } from "react";
import ComponentService from "services/componentService";

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

export const TubularView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, selectedObject, servers } = navigationState;
  const [tubularComponents, setTubularComponents] = useState<
    TubularComponent[]
  >([]);
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const selectedTubular = selectedObject as Tubular;

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedTubular) {
      const abortController = new AbortController();

      const getTubular = async () => {
        setTubularComponents(
          await ComponentService.getComponents(
            selectedTubular.wellUid,
            selectedTubular.wellboreUid,
            selectedTubular.uid,
            ComponentType.TubularComponent,
            undefined,
            abortController.signal
          )
        );
        setIsFetchingData(false);
      };

      getTubular();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedTubular]);

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

  return selectedTubular && !isFetchingData ? (
    <ContentTable
      viewId="tubularView"
      columns={columns}
      data={tubularComponentRows}
      onContextMenu={onContextMenu}
      checkableRows
      showRefresh
      downloadToCsvFileName={`Tubular_${selectedTubular.name}`}
    />
  ) : (
    <></>
  );
};

export default TubularView;
