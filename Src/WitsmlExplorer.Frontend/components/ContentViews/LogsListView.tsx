import { Switch, Typography } from "@equinor/eds-core-react";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, {
  calculateLogTypeDepthId,
  calculateLogTypeId,
  calculateLogTypeTimeId
} from "../../models/wellbore";
import ObjectService from "../../services/objectService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import LogObjectContextMenu from "../ContextMenus/LogObjectContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
import LogsGraph from "./Charts/LogsGraph";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface LogObjectRow extends ContentTableRow, LogObject {
  logObject: LogObject;
}

export const LogsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { wells, selectedWellbore, selectedWell, selectedLogTypeGroup } =
    navigationState;
  const { wellUid, wellboreUid, logType } = useParams();
  console.log("wells:", wells);
  console.log("selectedLogTypeGroup:", selectedLogTypeGroup);

  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const [logs, setLogs] = useState<LogObject[]>([]);
  const [resetCheckedItems, setResetCheckedItems] = useState(false);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    console.log("updateState effect");
    const well: Well = wells.filter((well) => well.uid === wellUid)[0];
    const wellbore: Wellbore = well?.wellbores?.filter(
      (wellbore) => wellbore.uid === wellboreUid
    )[0];

    const onSelectObjectGroup = async (wellbore: Wellbore) => {
      const objects = await ObjectService.getObjectsIfMissing(
        wellbore,
        ObjectType.Log
      );
      dispatchNavigation({
        type: NavigationType.SelectObjectGroup,
        payload: {
          wellUid: wellUid,
          wellboreUid: wellboreUid,
          objectType: ObjectType.Log,
          objects
        }
      });
    };

    const onSelects = async (well: Well, wellbore: Wellbore, logType: any) => {
      console.log("logType inside:", logType);
      const logTypeGroup =
        logType === 0
          ? calculateLogTypeDepthId(wellbore)
          : calculateLogTypeTimeId(wellbore);

      console.log("logTypeGroup:", logTypeGroup);
      dispatchNavigation({
        type: NavigationType.SelectLogType,
        payload: {
          well: well,
          wellbore: wellbore,
          logTypeGroup: logTypeGroup
        }
      });
    };

    const updateWellborePartial = async () => {
      const objectCount = await ObjectService.getExpandableObjectsCount(
        wellbore
      );

      dispatchNavigation({
        type: ModificationType.UpdateWellborePartial,
        payload: {
          wellboreUid: wellbore.uid,
          wellUid: wellbore.wellUid,
          wellboreProperties: { objectCount }
        }
      });
    };

    if (well) {
      // dispatchNavigation({
      //   type: NavigationType.SelectWellbore,
      //   payload: { well, wellbore }
      // });
      if (wellbore?.objectCount == null) {
        console.log("logType:", logType);
        onSelects(well, wellbore, logType === "depth" ? 0 : 1);
        onSelectObjectGroup(wellbore);
        updateWellborePartial();
      }
    }
  }, [
    wells,
    wellUid,
    wellboreUid,
    selectedWell,
    selectedWellbore,
    selectedLogTypeGroup
  ]);

  useEffect(() => {
    if (selectedWellbore?.logs) {
      setLogs(
        selectedWellbore.logs.filter(
          (log) =>
            calculateLogTypeId(selectedWellbore, log.indexType) ===
            selectedLogTypeGroup
        )
      );
    }
  }, [selectedLogTypeGroup, selectedWellbore]);

  const isTimeIndexed = () => {
    return selectedLogTypeGroup === calculateLogTypeTimeId(selectedWellbore);
  };

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedLogObjectRows: LogObjectRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedLogObjectRows.map((row) => row.logObject),
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <LogObjectContextMenu {...contextProps} />,
        position
      }
    });
  };

  const getTableData = (): LogObjectRow[] => {
    return logs.map((log) => {
      return {
        ...log,
        id: log.uid,
        startIndex:
          selectedWellbore && isTimeIndexed()
            ? formatDateString(log.startIndex, timeZone, dateTimeFormat)
            : log.startIndex,
        endIndex:
          selectedWellbore && isTimeIndexed()
            ? formatDateString(log.endIndex, timeZone, dateTimeFormat)
            : log.endIndex,
        dTimCreation: formatDateString(
          log.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          log.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        logObject: log
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    {
      property: "startIndex",
      label: "startIndex",
      type:
        selectedWellbore && isTimeIndexed()
          ? ContentType.DateTime
          : ContentType.Measure
    },
    {
      property: "endIndex",
      label: "endIndex",
      type:
        selectedWellbore && isTimeIndexed()
          ? ContentType.DateTime
          : ContentType.Measure
    },
    { property: "mnemonics", label: "mnemonics", type: ContentType.Number },
    {
      property: "serviceCompany",
      label: "serviceCompany",
      type: ContentType.String
    },
    { property: "runNumber", label: "runNumber", type: ContentType.String },
    { property: "indexType", label: "indexType", type: ContentType.String },
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

  const onSelect = (log: LogObjectRow) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: {
        object: log.logObject,
        well: selectedWell,
        wellbore: selectedWellbore,
        objectType: ObjectType.Log
      }
    });
  };

  useEffect(() => {
    if (resetCheckedItems) {
      setResetCheckedItems(false);
      setSelectedRows([]);
    }
  }, [resetCheckedItems]);

  useEffect(() => {
    setResetCheckedItems(true);
  }, [selectedWellbore, selectedLogTypeGroup]);

  return selectedWellbore && !resetCheckedItems ? (
    <ContentContainer>
      <CommonPanelContainer>
        <Switch checked={showGraph} onChange={() => setShowGraph(!showGraph)} />
        <Typography>
          Gantt view{selectedRows.length > 0 && " (selected logs only)"}
        </Typography>
      </CommonPanelContainer>
      {showGraph ? (
        <LogsGraph selectedLogs={selectedRows} />
      ) : (
        <ContentTable
          viewId={isTimeIndexed() ? "timeLogsListView" : "depthLogsListView"}
          columns={columns}
          onSelect={onSelect}
          data={getTableData()}
          onContextMenu={onContextMenu}
          onRowSelectionChange={(rows) =>
            setSelectedRows(rows as LogObjectRow[])
          }
          checkableRows
          showRefresh
          initiallySelectedRows={selectedRows}
          downloadToCsvFileName={isTimeIndexed() ? "TimeLogs" : "DepthLogs"}
        />
      )}
    </ContentContainer>
  ) : (
    <></>
  );
};

const CommonPanelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  > p {
    margin-left: -1rem;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export default LogsListView;
