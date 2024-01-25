import { useCallback, useContext } from "react";
import { QueryTemplatePreset } from "components/ContentViews/QueryViewUtils";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { QueryActionType, QueryContext } from "contexts/queryContext";

export type OpenInQueryView = (templatePreset: QueryTemplatePreset) => void;

export const useOpenInQueryView = () => {
  const { dispatchQuery } = useContext(QueryContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { dispatchNavigation } = useContext(NavigationContext);

  const openInQueryView = useCallback(
    (templatePreset: QueryTemplatePreset) => {
      dispatchOperation({ type: OperationType.HideContextMenu });
      dispatchQuery({
        type: QueryActionType.SetFromTemplatePreset,
        templatePreset
      });
      dispatchNavigation({ type: NavigationType.SelectQueryView, payload: {} });
    },
    [dispatchOperation, dispatchQuery, dispatchNavigation]
  );

  return openInQueryView;
};
