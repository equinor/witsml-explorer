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
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import RiskObject from "models/riskObject";
import React, { useContext, useEffect, useState } from "react";

export interface RiskObjectRow extends ContentTableRow, RiskObject {
  risk: RiskObject;
}

export const RisksListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const [risks, setRisks] = useState<RiskObject[]>([]);

  useEffect(() => {
    if (selectedWellbore?.risks) {
      setRisks(selectedWellbore.risks);
    }
  }, [selectedWellbore]);

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
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedRiskObjectRows: RiskObjectRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedRiskObjectRows.map((row) => row.risk),
      wellbore: selectedWellbore
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
    Object.is(selectedWellbore?.risks, risks) && (
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
};

export default RisksListView;
