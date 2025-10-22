import ChannelConfigurationsTable from "components/ContentViews/DataWorkOrder/ChannelConfigurationsTable";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { ReadOnlyPropertiesGrid } from "components/ReadOnlyProperties/ReadOnlyPropertiesGrid";
import { ReadOnlyPropertiesRendererProperty } from "components/ReadOnlyProperties/ReadOnlyPropertiesRenderer";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { ComponentType } from "models/componentType";
import { ObjectType } from "models/objectType";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import styled from "styled-components";

export default function DataSourceConfigurationView() {
  const {
    wellUid,
    wellboreUid,
    objectUid,
    componentUid,
    dataSourceConfigurationUid
  } = useParams();
  const { connectedServer } = useConnectedServer();
  const { object: dataWorkOrder, isFetched: isFetchedDataWorkOrder } =
    useGetObject(
      connectedServer,
      wellUid,
      wellboreUid,
      ObjectType.DataWorkOrder,
      objectUid
    );
  const { components: dataSourceConfigurationSets } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.DataSourceConfigurationSet,
    { placeholderData: [] }
  );
  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.DataWorkOrder);

  const dataSourceConfigurationSet = dataSourceConfigurationSets?.find(
    (set) => set.uid === componentUid
  );
  const dataSourceConfiguration =
    dataSourceConfigurationSet?.dataSourceConfigurations?.find(
      (config) => config.uid === dataSourceConfigurationUid
    );

  if (isFetchedDataWorkOrder && !dataWorkOrder) {
    return <ItemNotFound itemType={ObjectType.DataWorkOrder} />;
  }

  return (
    <ContentLayout>
      <ReadOnlyPropertiesGrid
        properties={properties}
        object={dataSourceConfiguration}
        columns={7}
      />
      <ChannelConfigurationsTable />
    </ContentLayout>
  );
}

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
`;

const properties: ReadOnlyPropertiesRendererProperty[] = [
  {
    property: "name",
    propertyType: PropertyType.String
  },
  {
    property: "description",
    propertyType: PropertyType.String
  },
  {
    property: "depthStatus",
    propertyType: PropertyType.String
  },
  {
    property: "dTimPlannedStart",
    propertyType: PropertyType.DateTime
  },
  {
    property: "mdPlannedStart",
    propertyType: PropertyType.Measure
  },
  {
    property: "nominalHoleSize",
    propertyType: PropertyType.Measure
  },
  {
    property: "dTimChangeDeadline",
    propertyType: PropertyType.DateTime
  },
  {
    property: "versionNumber",
    propertyType: PropertyType.String
  },
  {
    property: "status",
    propertyType: PropertyType.String
  },
  {
    property: "timeStatus",
    propertyType: PropertyType.String
  },
  {
    property: "dTimPlannedStop",
    propertyType: PropertyType.DateTime
  },
  {
    property: "mdPlannedStop",
    propertyType: PropertyType.Measure
  },
  {
    property: "tubular",
    propertyType: PropertyType.RefNameString
  },
  {
    property: "uid",
    propertyType: PropertyType.String
  }
];
