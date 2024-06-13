import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import RiskObjectContextMenu from "components/ContextMenus/RiskContextMenu";
import formatDateString from "components/DateFormatter";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ObjectType } from "models/objectType";
import RiskObject from "models/riskObject";
import { MouseEvent } from "react";
import { useParams } from "react-router-dom";

export interface RiskObjectRow extends ContentTableRow, RiskObject {
  risk: RiskObject;
}

export default function RisksListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const { wellUid, wellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { objects: risks } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Risk
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Risk);

  const getTableData = () => {
    return risks.map((risk) => {
      return {
        ...risk,
        ...risk.commonData,
        id: risk.uid,
        mdBitStart: `${risk.mdBitStart?.value?.toFixed(4) ?? ""} ${
          risk.mdBitStart?.uom ?? ""
        }`,
        mdBitEnd: `${risk.mdBitEnd?.value?.toFixed(4) ?? ""} ${
          risk.mdBitEnd?.uom ?? ""
        }`,
        dTimStart: formatDateString(risk.dTimStart, timeZone, dateTimeFormat),
        dTimEnd: formatDateString(risk.dTimEnd, timeZone, dateTimeFormat),
        details: risk.details,
        summary: risk.summary,
        dTimCreation: formatDateString(
          risk.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          risk.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        risk: risk
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "type", label: "type", type: ContentType.String },
    {
      property: "sourceName",
      label: "commonData.sourceName",
      type: ContentType.String
    },
    { property: "mdBitStart", label: "mdBitStart", type: ContentType.String },
    { property: "mdBitEnd", label: "mdBitEnd", type: ContentType.String },
    { property: "dTimStart", label: "dTimStart", type: ContentType.DateTime },
    { property: "dTimEnd", label: "dTimEnd", type: ContentType.DateTime },
    { property: "name", label: "name", type: ContentType.String },
    { property: "summary", label: "summary", type: ContentType.String },
    {
      property: "severityLevel",
      label: "severityLevel",
      type: ContentType.String
    },
    { property: "category", label: "category", type: ContentType.String },
    { property: "subCategory", label: "subCategory", type: ContentType.String },
    {
      property: "affectedPersonnel",
      label: "affectedPersonnel",
      type: ContentType.String
    },
    { property: "details", label: "details", type: ContentType.String },
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

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedRiskObjectRows: RiskObjectRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedRiskObjectRows.map((row) => row.risk)
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <RiskObjectContextMenu {...contextProps} />,
        position
      }
    });
  };

  return (
    risks && (
      <ContentTable
        viewId="risksListView"
        columns={columns}
        data={getTableData()}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName="Risks"
      />
    )
  );
}
