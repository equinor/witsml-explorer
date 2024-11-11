import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TubularContextMenu from "components/ContextMenus/TubularContextMenu";
import formatDateString from "components/DateFormatter";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ObjectType } from "models/objectType";
import Tubular from "models/tubular";
import { MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getObjectViewPath } from "routes/utils/pathBuilder";

export default function TubularsListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const { wellUid, wellboreUid } = useParams();
  const { objects: tubulars } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Tubular
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Tubular);

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    tubulars: Tubular[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: tubulars
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <TubularContextMenu {...contextProps} />, position }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    {
      property: "typeTubularAssy",
      label: "typeTubularAssy",
      type: ContentType.String
    },
    { property: "uid", label: "uid", type: ContentType.String },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    }
  ];

  const onSelect = (tubular: any) => {
    navigate(
      getObjectViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        ObjectType.Tubular,
        tubular.uid
      )
    );
  };

  const tubularRows = tubulars?.map((tubular) => {
    return {
      ...tubular,
      dTimCreation: formatDateString(
        tubular.commonData.dTimCreation,
        timeZone,
        dateTimeFormat
      ),
      dTimLastChange: formatDateString(
        tubular.commonData.dTimLastChange,
        timeZone,
        dateTimeFormat
      ),
      id: tubular.uid
    };
  });

  return (
    tubulars && (
      <ContentTable
        viewId="tubularsListView"
        columns={columns}
        data={tubularRows}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName="Tubulars"
      />
    )
  );
}
