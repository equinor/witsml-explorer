import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import DataWorkOrderContextMenu from "components/ContextMenus/DataWorkOrderContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import formatDateString from "components/DateFormatter";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import DataWorkOrder from "models/dataWorkOrder/dataWorkOrder";
import { ObjectType } from "models/objectType";
import { MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getObjectViewPath } from "routes/utils/pathBuilder";
import { StyledLink } from "../../StyledComponents/Link.tsx";
import Icon from "../../../styles/Icons.tsx";

export interface DataWorkOrderRow extends ContentTableRow, DataWorkOrder {
  dataWorkOrder: DataWorkOrder;
}

export default function DataWorkOrdersListView() {
  const {
    operationState: { colors, timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const navigate = useNavigate();
  const { wellUid, wellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { objects: dataWorkOrders } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.DataWorkOrder
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.DataWorkOrder);

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedDataWorkOrderRows: DataWorkOrderRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedDataWorkOrderRows.map((row) => row.dataWorkOrder)
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <DataWorkOrderContextMenu {...contextProps} />,
        position
      }
    });
  };

  const getDwoDetailPath = (dwoId: string) =>
    getObjectViewPath(
      connectedServer?.url,
      wellUid,
      wellboreUid,
      ObjectType.DataWorkOrder,
      dwoId
    );

  const onSelect = (dataWorkOrder: DataWorkOrderRow) => {
    navigate(getDwoDetailPath(dataWorkOrder.uid));
  };

  const getTableData = () => {
    return dataWorkOrders.map((dataWorkOrder) => {
      return {
        ...dataWorkOrder,
        ...dataWorkOrder.commonData,
        id: dataWorkOrder.uid,
        dataWorkOrder: dataWorkOrder,
        setsCount: (
          <StyledLink to={getDwoDetailPath(dataWorkOrder.uid)} colors={colors}>
            <Icon name="layers" size={16} />
            {dataWorkOrder.dataSourceConfigurationSets.length} Sets
          </StyledLink>
        ),
        dTimPlannedStart: formatDateString(
          dataWorkOrder.dTimPlannedStart,
          timeZone,
          dateTimeFormat
        ),
        dTimPlannedStop: formatDateString(
          dataWorkOrder.dTimPlannedStop,
          timeZone,
          dateTimeFormat
        ),
        dTimCreation: formatDateString(
          dataWorkOrder.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          dataWorkOrder.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        )
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "field", label: "field", type: ContentType.String },
    {
      property: "setsCount",
      label: "dataSourceConfigurationSets",
      type: ContentType.Component,
      width: 200
    },
    {
      property: "dataProvider",
      label: "dataProvider",
      type: ContentType.String
    },
    {
      property: "dataConsumer",
      label: "dataConsumer",
      type: ContentType.String
    },
    { property: "description", label: "description", type: ContentType.String },
    {
      property: "dTimPlannedStart",
      label: "dTimPlannedStart",
      type: ContentType.DateTime
    },
    {
      property: "dTimPlannedStop",
      label: "dTimPlannedStop",
      type: ContentType.DateTime
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

  return (
    dataWorkOrders && (
      <ContentTable
        viewId="dataWorkOrdersListView"
        columns={columns}
        data={getTableData()}
        onContextMenu={onContextMenu}
        onSelect={onSelect}
        checkableRows
        showRefresh
        downloadToCsvFileName="DataWorkOrders"
      />
    )
  );
}
