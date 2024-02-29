import { QueryTemplatePreset } from "components/ContentViews/QueryViewUtils";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { QueryActionType, QueryContext } from "contexts/queryContext";
import { useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getQueryViewPath } from "routes/utils/pathBuilder";

export type OpenInQueryView = (templatePreset: QueryTemplatePreset) => void;

export const useOpenInQueryView = () => {
  const { dispatchQuery } = useContext(QueryContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { connectedServer } = useConnectedServer();
  const navigate = useNavigate();

  const openInQueryView = useCallback(
    (templatePreset: QueryTemplatePreset) => {
      dispatchOperation({ type: OperationType.HideContextMenu });
      dispatchQuery({
        type: QueryActionType.SetFromTemplatePreset,
        templatePreset
      });
      navigate(getQueryViewPath(connectedServer?.url));
    },
    [dispatchOperation, dispatchQuery, connectedServer]
  );

  return openInQueryView;
};
