import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreTubularAction, UpdateWellboreTubularsAction } from "../../contexts/navigationStateReducer";
import OperationType from "../../contexts/operationType";
import Tubular from "../../models/tubular";
import TubularService from "../../services/tubularService";
import { DispatchOperation } from "./ContextMenuUtils";

export const onClickRefresh = async (tubular: Tubular, dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreTubularAction) => void) => {
  let freshTubular = await TubularService.getTubular(tubular.wellUid, tubular.wellboreUid, tubular.uid);
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
  const tubulars = await TubularService.getTubulars(wellUid, wellboreUid);
  dispatchNavigation({ type: ModificationType.UpdateTubularsOnWellbore, payload: { tubulars, wellUid, wellboreUid } });
  dispatchOperation({ type: OperationType.HideContextMenu });
};
