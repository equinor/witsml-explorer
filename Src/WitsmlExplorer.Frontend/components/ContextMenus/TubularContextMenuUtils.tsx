import { UpdateWellboreTubularAction, UpdateWellboreTubularsAction } from "../../contexts/modificationActions";
import ModificationType from "../../contexts/modificationType";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import Tubular from "../../models/tubular";
import ObjectService from "../../services/objectService";
import { DispatchOperation } from "./ContextMenuUtils";

export const onClickRefresh = async (tubular: Tubular, dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreTubularAction) => void) => {
  let freshTubular = await ObjectService.getObject(tubular.wellUid, tubular.wellboreUid, tubular.uid, ObjectType.Tubular);
  const exists = !!freshTubular;
  if (!exists) {
    freshTubular = tubular;
  }
  dispatchNavigation({
    type: ModificationType.UpdateTubularOnWellbore,
    payload: { tubular: freshTubular, exists: exists }
  });
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickRefreshAll = async (
  wellUid: string,
  wellboreUid: string,
  dispatchOperation: DispatchOperation,
  dispatchNavigation: (action: UpdateWellboreTubularsAction) => void
) => {
  const tubulars = await ObjectService.getObjects(wellUid, wellboreUid, ObjectType.Tubular);
  dispatchNavigation({ type: ModificationType.UpdateTubularsOnWellbore, payload: { tubulars, wellUid, wellboreUid } });
  dispatchOperation({ type: OperationType.HideContextMenu });
};
