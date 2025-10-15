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
      inset: channelConfiguration.requirements.map((requirement) => ({
        purpose: requirement.purpose,
        comments: requirement.comments,
        minInterval: measureToString(requirement.minInterval),
        maxInterval: measureToString(requirement.maxInterval),
        minPrecision: measureToString(requirement.minPrecision),
        maxPrecision: measureToString(requirement.maxPrecision),
        minValue: measureToString(requirement.minValue),
        maxValue: measureToString(requirement.maxValue),
        minStep: measureToString(requirement.minStep),
        maxStep: measureToString(requirement.maxStep),
        minDelta: measureToString(requirement.minDelta),
        maxDelta: measureToString(requirement.maxDelta),
        latency: measureToString(requirement.latency),
        mdThreshold: measureToString(requirement.mdThreshold),
        dynamicMdThreshold: requirement.dynamicMdThreshold
      }))
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
        insetColumns={insetColumns}
        showRefresh
        downloadToCsvFileName="ChannelConfigurations"
      />
    </>
  );
}

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
  { property: "description", label: "description", type: ContentType.String },
  { property: "comments", label: "comments", type: ContentType.String },
  { property: "uid", label: "uid", type: ContentType.String }
];

const insetColumns: ContentTableColumn[] = [
  { property: "purpose", label: "purpose", type: ContentType.String },
  { property: "comments", label: "comments", type: ContentType.String },
  { property: "minInterval", label: "minInterval", type: ContentType.Measure },
  { property: "maxInterval", label: "maxInterval", type: ContentType.Measure },
  {
    property: "minPrecision",
    label: "minPrecision",
    type: ContentType.Measure
  },
  {
    property: "maxPrecision",
    label: "maxPrecision",
    type: ContentType.Measure
  },
  { property: "minValue", label: "minValue", type: ContentType.Measure },
  { property: "maxValue", label: "maxValue", type: ContentType.Measure },
  { property: "minStep", label: "minStep", type: ContentType.Measure },
  { property: "maxStep", label: "maxStep", type: ContentType.Measure },
  { property: "minDelta", label: "minDelta", type: ContentType.Measure },
  { property: "maxDelta", label: "maxDelta", type: ContentType.Measure },
  { property: "latency", label: "latency", type: ContentType.Measure },
  { property: "mdThreshold", label: "mdThreshold", type: ContentType.Measure },
  {
    property: "dynamicMdThreshold",
    label: "dynamicMdThreshold",
    type: ContentType.String
  }
];
