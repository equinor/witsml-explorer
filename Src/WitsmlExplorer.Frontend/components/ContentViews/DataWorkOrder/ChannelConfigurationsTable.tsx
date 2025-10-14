import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetComponents } from "hooks/query/useGetComponents";
import { ComponentType } from "models/componentType";
import { measureToString } from "models/measure";
import { useParams } from "react-router-dom";

export default function ChannelSetsTable() {
  const {
    wellUid,
    wellboreUid,
    objectUid,
    componentUid,
    dataSourceConfigurationUid
  } = useParams();
  const { connectedServer } = useConnectedServer();

  const { components: dataSourceConfigurationSets, isFetching } =
    useGetComponents(
      connectedServer,
      wellUid,
      wellboreUid,
      objectUid,
      ComponentType.DataSourceConfigurationSet,
      { placeholderData: [] }
    );
  const dataSourceConfigurationSet = dataSourceConfigurationSets?.find(
    (set) => set.uid === componentUid
  );
  const dataSourceConfiguration =
    dataSourceConfigurationSet?.dataSourceConfigurations?.find(
      (config) => config.uid === dataSourceConfigurationUid
    );
  const channelConfigurations =
    dataSourceConfiguration?.channelConfigurations ?? [];

  const columns: ContentTableColumn[] = [
    { property: "mnemonic", label: "mnemonic", type: ContentType.String },
    { property: "criticality", label: "criticality", type: ContentType.String },
    {
      property: "globalMnemonic",
      label: "globalMnemonic",
      type: ContentType.String
    },
    { property: "indexType", label: "indexType", type: ContentType.String },
    { property: "toolName", label: "toolName", type: ContentType.String },
    { property: "service", label: "service", type: ContentType.String },
    { property: "uom", label: "uom", type: ContentType.String },
    {
      property: "sensorOffset",
      label: "sensorOffset",
      type: ContentType.Measure
    },
    { property: "logName", label: "logName", type: ContentType.String },
    {
      property: "requirements",
      label: "requirements",
      type: ContentType.Component
    },
    { property: "description", label: "description", type: ContentType.String },
    { property: "comments", label: "comments", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const channelConfigurationRows = channelConfigurations.map(
    (channelConfiguration) => ({
      id: channelConfiguration.uid,
      uid: channelConfiguration.uid,
      mnemonic: channelConfiguration.mnemonic,
      uom: channelConfiguration.uom,
      globalMnemonic: channelConfiguration.globalMnemonic,
      indexType: channelConfiguration.indexType,
      toolName: channelConfiguration.toolName,
      service: channelConfiguration.service,
      sensorOffset: measureToString(channelConfiguration.sensorOffset),
      criticality: channelConfiguration.criticality,
      logName: channelConfiguration.logName,
      description: channelConfiguration.description,
      comments: channelConfiguration.comments,
      requirements: <div>Todo: requirements</div>
    })
  );

  return (
    <>
      {isFetching && (
        <ProgressSpinnerOverlay message="Fetching DataWorkOrder." />
      )}
      <ContentTable
        viewId="channelConfigurations"
        columns={columns}
        data={channelConfigurationRows}
        checkableRows
        showRefresh
        downloadToCsvFileName="ChannelConfigurations"
      />
    </>
  );
}
