import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import TubularService from "../../services/tubularService";
import TubularComponent from "../../models/tubularComponent";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import TubularComponentContextMenu, { TubularComponentContextMenuProps } from "../ContextMenus/TubularComponentContextMenu";
import OperationType from "../../contexts/operationType";

export const TubularView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer, selectedTubular } = navigationState;
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

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedTubularComponents: TubularComponent[]) => {
    const contextMenuProps: TubularComponentContextMenuProps = { checkedTubularComponents, dispatchOperation, selectedTubular, selectedServer };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TubularComponentContextMenu {...contextMenuProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "sequence", label: "Sequence", type: ContentType.Number },
    { property: "typeTubularComponent", label: "typeTubularComponent", type: ContentType.String },
    { property: "innerDiameter", label: "id", type: ContentType.Number },
    { property: "od", label: "od", type: ContentType.Number },
    { property: "len", label: "len", type: ContentType.Number },
    { property: "tubularName", label: "tubularName", type: ContentType.String },
    { property: "typeTubularAssy", label: "typeTubularAssy", type: ContentType.String },
    { property: "uid", label: "Uid", type: ContentType.String }
  ];

  const tubularComponentRows = tubularComponents.map((tubularComponent) => {
    return {
      id: tubularComponent.uid,
      sequence: tubularComponent.sequence,
      typeTubularComponent: tubularComponent.typeTubularComponent,
      innerDiameter: tubularComponent.id,
      od: tubularComponent.od,
      len: tubularComponent.len,
      tubularName: selectedTubular?.name,
      typeTubularAssy: selectedTubular?.typeTubularAssy,
      uid: tubularComponent.uid
    };
  });

  return selectedTubular && !isFetchingData ? <ContentTable columns={columns} data={tubularComponentRows} onContextMenu={onContextMenu} checkableRows /> : <></>;
};

export default TubularView;
