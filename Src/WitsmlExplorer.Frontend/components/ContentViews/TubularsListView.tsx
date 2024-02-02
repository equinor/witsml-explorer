import { MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { useGetObjects } from "../../hooks/useGetObjects";
import { ObjectType } from "../../models/objectType";
import Tubular from "../../models/tubular";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import TubularContextMenu from "../ContextMenus/TubularContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export default function TubularsListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { wellUid, wellboreUid } = useParams();
  const { wellbore } = useGetWellbore(
    authorizationState?.server,
    wellUid,
    wellboreUid
  );

  const tubulars = useGetObjects(
    wellUid,
    wellboreUid,
    ObjectType.Tubular
  ) as Tubular[];

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Tubular);

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    tubulars: Tubular[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: tubulars,
      wellbore: wellbore
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
      `/servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${
        ObjectType.Tubular
      }/objects/${tubular.uid}`
    );
  };

  const tubularRows = tubulars.map((tubular) => {
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
