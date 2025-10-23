import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import formatDateString from "components/DateFormatter";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { StyledLink, StyledLinkButton } from "components/StyledComponents/Link";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import DataSourceConfigurationSet, {
  getLastDataSourceConfiguration
} from "models/dataWorkOrder/dataSourceConfigurationSet";
import { ObjectType } from "models/objectType";
import { useParams } from "react-router-dom";
import {
  getComponentViewPath,
  getDataSourceConfigurationViewPath
} from "routes/utils/pathBuilder";
import DataSourceConfiguration from "models/dataWorkOrder/dataSourceConfiguration";
import OperationType from "contexts/operationType";
import ConfigurationChangeReasonModal from "components/Modals/ConfigurationChangeReasonModal";

import { MouseEventHandler } from "react";

export interface DataSourceConfigurationSetRow extends ContentTableRow {
  id: string;
  uid: string;
  dataSourceConfigurationSet: DataSourceConfigurationSet;
}

export default function DataSourceConfigurationSetsTable() {
  const { wellUid, wellboreUid, objectUid } = useParams();
  const {
    operationState: { colors, dateTimeFormat, timeZone },
    dispatchOperation
  } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const { object: dataWorkOrder } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.DataWorkOrder,
    objectUid
  );

  const { components: dataSourceConfigurationSets, isFetching } =
    useGetComponents(
      connectedServer,
      wellUid,
      wellboreUid,
      objectUid,
      ComponentType.DataSourceConfigurationSet,
      { placeholderData: [] }
    );

  const getSetPath = (setUid: string) => {
    return getComponentViewPath(
      connectedServer?.url,
      wellUid,
      wellboreUid,
      ObjectType.DataWorkOrder,
      objectUid,
      ComponentType.DataSourceConfigurationSet,
      setUid
    );
  };

  const getConfigPath = (setUid: string, configUid: string) => {
    return getDataSourceConfigurationViewPath(
      connectedServer?.url,
      wellUid,
      wellboreUid,
      objectUid,
      setUid,
      configUid
    );
  };

  const handleChangeReasonClick =
    (
      dataSourceConfiguration: DataSourceConfiguration
    ): MouseEventHandler<HTMLDivElement> =>
    (e) => {
      e.stopPropagation();
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: (
          <ConfigurationChangeReasonModal
            dataSourceConfiguration={dataSourceConfiguration}
          />
        )
      });
    };

  const dataSourceConfigurationSetRows: DataSourceConfigurationSetRow[] =
    dataSourceConfigurationSets.map((dataSourceConfigurationSet) => {
      const lastConfig = getLastDataSourceConfiguration(
        dataSourceConfigurationSet
      );
      const versionCount =
        dataSourceConfigurationSet.dataSourceConfigurations?.length ?? 0;

      return {
        id: dataSourceConfigurationSet.uid,
        uid: dataSourceConfigurationSet.uid,
        dTimPlannedStart: formatDateString(
          lastConfig?.dTimPlannedStart,
          timeZone,
          dateTimeFormat
        ),
        dTimPlannedStop: formatDateString(
          lastConfig?.dTimPlannedStop,
          timeZone,
          dateTimeFormat
        ),
        dataSourceConfigurationSet: dataSourceConfigurationSet,
        version: (
          <StyledLink
            to={getSetPath(dataSourceConfigurationSet.uid)}
            colors={colors}
          >
            {versionCount} available
          </StyledLink>
        ),
        changeReason: lastConfig.changeReason && (
          <StyledLinkButton
            colors={colors}
            onClick={handleChangeReasonClick(lastConfig)}
          >
            See details
          </StyledLinkButton>
        ),
        lastConfig: (
          <StyledLink
            to={getConfigPath(dataSourceConfigurationSet.uid, lastConfig?.uid)}
            colors={colors}
          >
            {lastConfig?.name}
          </StyledLink>
        )
      };
    });

  return (
    <>
      {isFetching && (
        <ProgressSpinnerOverlay message="Fetching DataSourceConfigurationSets." />
      )}
      <ContentTable
        viewId="dataSourceConfigurationSets"
        columns={columns}
        data={dataSourceConfigurationSetRows}
        showRefresh
        downloadToCsvFileName={`DataWorkOrder_${dataWorkOrder?.name}_dataSourceConfigurationSets`}
      />
    </>
  );
}

const columns: ContentTableColumn[] = [
  {
    property: "lastConfig",
    label: "Last Configuration",
    type: ContentType.Component,
    width: 250
  },
  {
    property: "changeReason",
    label: "Last Change Reason",
    type: ContentType.Component,
    width: 150
  },
  {
    property: "version",
    label: "Versions",
    type: ContentType.Component,
    width: 150
  },
  {
    property: "dTimPlannedStart",
    label: "Planned Start",
    type: ContentType.DateTime
  },
  {
    property: "dTimPlannedStop",
    label: "Planned Stop",
    type: ContentType.DateTime
  },
  { property: "uid", label: "Configuration Set uid", type: ContentType.String }
];
