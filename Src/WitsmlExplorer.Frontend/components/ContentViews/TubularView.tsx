import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import TubularService from "../../services/tubularService";
import TubularComponent from "../../models/tubularComponent";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import TubularComponentContextMenu, { TubularComponentContextMenuProps } from "../ContextMenus/TubularComponentContextMenu";
import OperationType from "../../contexts/operationType";

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
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer, selectedTubular, servers } = navigationState;
  const [tubularComponents, setTubularComponents] = useState<TubularComponent[]>([]);
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedTubular) {
      const abortController = new AbortController();

      const getTubular = async () => {
        setTubularComponents(await TubularService.getTubularComponents(selectedTubular.wellUid, selectedTubular.wellboreUid, selectedTubular.uid, abortController.signal));
        setIsFetchingData(false);
      };

      getTubular();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedTubular]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedTubularComponents: TubularComponentRow[]) => {
    const contextMenuProps: TubularComponentContextMenuProps = {
      checkedTubularComponents,
      dispatchOperation,
      tubular: selectedTubular,
      selectedServer,
      servers
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TubularComponentContextMenu {...contextMenuProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "sequence", label: "Sequence", type: ContentType.Number },
    { property: "typeTubularComponent", label: "typeTubularComponent", type: ContentType.String },
    { property: "innerDiameter", label: "id", type: ContentType.String },
    { property: "od", label: "od", type: ContentType.String },
    { property: "len", label: "len", type: ContentType.String },
    { property: "tubularName", label: "tubularName", type: ContentType.String },
    { property: "typeTubularAssy", label: "typeTubularAssy", type: ContentType.String },
    { property: "uid", label: "Uid", type: ContentType.String }
  ];

  const tubularComponentRows = tubularComponents.map((tubularComponent) => {
    return {
      id: tubularComponent.uid,
      sequence: tubularComponent.sequence,
      typeTubularComponent: tubularComponent.typeTubularComponent,
      innerDiameter: `${tubularComponent.id?.value?.toFixed(4)} ${tubularComponent.id?.uom}`,
      od: `${tubularComponent.od?.value?.toFixed(4)} ${tubularComponent.od?.uom}`,
      len: `${tubularComponent.len?.value?.toFixed(4)} ${tubularComponent.len?.uom}`,
      tubularName: selectedTubular?.name,
      typeTubularAssy: selectedTubular?.typeTubularAssy,
      uid: tubularComponent.uid,
      tubularComponent: tubularComponent
    };
  });

  return selectedTubular && !isFetchingData ? <ContentTable columns={columns} data={tubularComponentRows} onContextMenu={onContextMenu} checkableRows /> : <></>;
};

export default TubularView;
