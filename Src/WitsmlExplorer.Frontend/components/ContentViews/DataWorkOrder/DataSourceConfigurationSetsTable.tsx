import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import formatDateString from "components/DateFormatter";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { StyledLink } from "components/StyledComponents/Link";
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

export interface DataSourceConfigurationSetRow extends ContentTableRow {
  id: string;
  uid: string;
  numConfigurations: number;
  dataSourceConfigurationSet: DataSourceConfigurationSet;
}

export default function DataSourceConfigurationSetsTable() {
  const { wellUid, wellboreUid, objectUid } = useParams();
  const {
    operationState: { colors, dateTimeFormat, timeZone }
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

  const dataSourceConfigurationSetRows: DataSourceConfigurationSetRow[] =
    dataSourceConfigurationSets.map((dataSourceConfigurationSet) => {
      const lastConfig = getLastDataSourceConfiguration(
        dataSourceConfigurationSet
      );
      return {
        id: dataSourceConfigurationSet.uid,
        uid: dataSourceConfigurationSet.uid,
        numConfigurations:
          dataSourceConfigurationSet.dataSourceConfigurations?.length ?? 0,
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
        set: (
          <StyledLink
            to={getSetPath(dataSourceConfigurationSet.uid)}
            colors={colors}
          >
            Show versions
          </StyledLink>
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
    type: ContentType.Component
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
  { property: "set", label: "Set", type: ContentType.Component },
  {
    property: "numConfigurations",
    label: "Versions",
    type: ContentType.String
  },
  { property: "uid", label: "uid", type: ContentType.String }
];
