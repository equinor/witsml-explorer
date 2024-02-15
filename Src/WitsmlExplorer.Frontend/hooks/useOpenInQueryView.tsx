import { useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { QueryTemplatePreset } from "../components/ContentViews/QueryViewUtils";
import { useAuthorizationState } from "../contexts/authorizationStateContext";
import OperationContext from "../contexts/operationContext";
import OperationType from "../contexts/operationType";
import { QueryActionType, QueryContext } from "../contexts/queryContext";

export type OpenInQueryView = (templatePreset: QueryTemplatePreset) => void;

export const useOpenInQueryView = () => {
  const { dispatchQuery } = useContext(QueryContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { authorizationState } = useAuthorizationState();
  const navigate = useNavigate();

  const openInQueryView = useCallback(
    (templatePreset: QueryTemplatePreset) => {
      dispatchOperation({ type: OperationType.HideContextMenu });
      dispatchQuery({
        type: QueryActionType.SetFromTemplatePreset,
        templatePreset
      });
      navigate(
        `servers/${encodeURIComponent(authorizationState?.server?.url)}/query`
      );
    },
    [dispatchOperation, dispatchQuery, authorizationState]
  );

  return openInQueryView;
};
