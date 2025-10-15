import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import formatDateString from "components/DateFormatter";
import { ConfigurationChangeReasonModal } from "components/Modals/ConfigurationChangeReasonModal";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { StyledLinkButton } from "components/StyledComponents/Link";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import ConfigurationChangeReason from "models/dataWorkOrder/configurationChangeReason";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import { useNavigate, useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import { getDataSourceConfigurationViewPath } from "routes/utils/pathBuilder";

export default function DataSourceConfigurationSetView() {
  const { wellUid, wellboreUid, objectUid, componentUid } = useParams();
  const {
    operationState: { colors, timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const {
    components: dataSourceConfigurationSets,
    isFetching,
    isFetched
  } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.DataSourceConfigurationSet
  );
  const navigate = useNavigate();
  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.DataWorkOrder);

  const dataSourceConfigurationSet = dataSourceConfigurationSets?.find(
    (set) => set.uid === componentUid
  );
  const dataSourceConfigurations =
    dataSourceConfigurationSet?.dataSourceConfigurations ?? [];

  const onSelect = (row: ContentTableRow) => {
    navigate(
      getDataSourceConfigurationViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        objectUid,
        componentUid,
        row.id
      )
    );
  };

  const onClickChangeReason = (
    event: React.MouseEvent,
    changeReason: ConfigurationChangeReason
  ) => {
    event.stopPropagation();
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ConfigurationChangeReasonModal changeReason={changeReason} />
    });
  };

  const dataSourceConfigurationRows = dataSourceConfigurations.map(
    (dataSourceConfiguration) => {
      return {
        id: dataSourceConfiguration.uid,
        uid: dataSourceConfiguration.uid,
        versionNumber: dataSourceConfiguration.versionNumber,
        name: dataSourceConfiguration.name,
        numChannels: dataSourceConfiguration.channelConfigurations.length,
        description: dataSourceConfiguration.description,
        status: dataSourceConfiguration.status,
        nominalHoleSize: measureToString(
          dataSourceConfiguration.nominalHoleSize
        ),
        tubular: dataSourceConfiguration.tubular?.value,
        depthStatus: dataSourceConfiguration.depthStatus,
        timeStatus: dataSourceConfiguration.timeStatus,
        dTimPlannedStart: formatDateString(
          dataSourceConfiguration.dTimPlannedStart,
          timeZone,
          dateTimeFormat
        ),
        dTimPlannedStop: formatDateString(
          dataSourceConfiguration.dTimPlannedStop,
          timeZone,
          dateTimeFormat
        ),
        mdPlannedStart: measureToString(dataSourceConfiguration.mdPlannedStart),
        mdPlannedStop: measureToString(dataSourceConfiguration.mdPlannedStop),
        dTimChangeDeadline: formatDateString(
          dataSourceConfiguration.dTimChangeDeadline,
          timeZone,
          dateTimeFormat
        ),
        changeReason: dataSourceConfiguration.changeReason && (
          <StyledLinkButton
            colors={colors}
            onClick={(event) =>
              onClickChangeReason(event, dataSourceConfiguration.changeReason)
            }
          >
            See details
          </StyledLinkButton>
        ),
        dataSourceConfiguration: dataSourceConfiguration
      };
    }
  );

  if (isFetched && !dataSourceConfigurationSets) {
    return (
      <ItemNotFound
        itemType={ComponentType.DataSourceConfigurationSet}
        isMultiple
      />
    );
  }

  return (
    <>
      {isFetching && (
        <ProgressSpinnerOverlay message="Fetching DataSourceConfigurationSets." />
      )}
      <ContentTable
        viewId="dataSourceConfigurations"
        columns={columns}
        data={dataSourceConfigurationRows}
        onSelect={onSelect}
        showRefresh
        downloadToCsvFileName="DataSourceConfigurations"
      />
    </>
  );
}

const columns: ContentTableColumn[] = [
  {
    property: "versionNumber",
    label: "versionNumber",
    type: ContentType.String
  },
  { property: "name", label: "name", type: ContentType.String },
  { property: "numChannels", label: "channels", type: ContentType.String },
  { property: "uid", label: "uid", type: ContentType.String },
  { property: "description", label: "description", type: ContentType.String },
  { property: "status", label: "status", type: ContentType.String },
  {
    property: "nominalHoleSize",
    label: "nominalHoleSize",
    type: ContentType.Measure
  },
  { property: "tubular", label: "tubular", type: ContentType.String },
  { property: "depthStatus", label: "depthStatus", type: ContentType.String },
  { property: "timeStatus", label: "timeStatus", type: ContentType.String },
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
  {
    property: "mdPlannedStart",
    label: "mdPlannedStart",
    type: ContentType.Measure
  },
  {
    property: "mdPlannedStop",
    label: "mdPlannedStop",
    type: ContentType.Measure
  },
  {
    property: "dTimChangeDeadline",
    label: "dTimChangeDeadline",
    type: ContentType.DateTime
  },
  {
    property: "changeReason",
    label: "changeReason",
    type: ContentType.Component
  }
];
