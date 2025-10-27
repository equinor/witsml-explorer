import { Divider, Tabs } from "@equinor/eds-core-react";
import AssetContactsTable from "components/ContentViews/DataWorkOrder/AssetContactsTable";
import DataSourceConfigurationSetsTable from "components/ContentViews/DataWorkOrder/DataSourceConfigurationSetsTable";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { ReadOnlyPropertiesGrid } from "components/ReadOnlyProperties/ReadOnlyPropertiesGrid";
import { ReadOnlyPropertiesRendererProperty } from "components/ReadOnlyProperties/ReadOnlyPropertiesRenderer";
import { StyledTab } from "components/StyledComponents/StyledTab";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ObjectType } from "models/objectType";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import styled from "styled-components";
import { Colors } from "../../../styles/Colors.tsx";

export default function DataWorkOrderView() {
  const { wellUid, wellboreUid, objectUid } = useParams();
  const {
    operationState: { colors }
  } = useOperationState();
  const [tabIndex, setTabIndex] = useState(0);
  const { connectedServer } = useConnectedServer();
  const { object: dataWorkOrder, isFetched: isFetchedDataWorkOrder } =
    useGetObject(
      connectedServer,
      wellUid,
      wellboreUid,
      ObjectType.DataWorkOrder,
      objectUid
    );
  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.DataWorkOrder);

  if (isFetchedDataWorkOrder && !dataWorkOrder) {
    return <ItemNotFound itemType={ObjectType.DataWorkOrder} />;
  }

  return (
    <ContentLayout>
      <ReadOnlyPropertiesGrid properties={properties} object={dataWorkOrder} />
      <Tabs
        activeTab={tabIndex}
        onChange={setTabIndex}
        scrollable
        style={{ whiteSpace: "nowrap" }}
      >
        <TabStack colors={colors}>
          <Tabs.List style={{ minWidth: "fit-content" }}>
            <StyledTab colors={colors}>Configuration sets</StyledTab>
            <StyledTab colors={colors}>Contacts</StyledTab>
          </Tabs.List>
          <Divider />
        </TabStack>
        <Tabs.Panels>
          <Tabs.Panel>
            <DataSourceConfigurationSetsTable />
          </Tabs.Panel>
          <Tabs.Panel>
            <AssetContactsTable />
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    </ContentLayout>
  );
}

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
`;

const TabStack = styled.div<{ colors: Colors }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;

  hr {
    width: 100%;
    margin: 0;
    background-color: ${({ colors }) => colors.interactive.disabledBorder};
  }
`;

const properties: ReadOnlyPropertiesRendererProperty[] = [
  {
    property: "name",
    propertyType: PropertyType.String
  },
  {
    property: "dTimPlannedStart",
    propertyType: PropertyType.DateTime
  },
  {
    property: "dataProvider",
    propertyType: PropertyType.String
  },
  {
    property: "description",
    propertyType: PropertyType.String
  },
  {
    property: "field",
    propertyType: PropertyType.String
  },
  {
    property: "dTimPlannedStop",
    propertyType: PropertyType.DateTime
  },
  {
    property: "dataConsumer",
    propertyType: PropertyType.String
  },
  {
    property: "uid",
    propertyType: PropertyType.String
  }
];
