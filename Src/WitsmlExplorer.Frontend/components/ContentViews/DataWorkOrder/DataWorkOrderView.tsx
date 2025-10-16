import { Tabs } from "@equinor/eds-core-react";
import AssetContactsTable from "components/ContentViews/DataWorkOrder/AssetContactsTable";
import DataSourceConfigurationSetsTable from "components/ContentViews/DataWorkOrder/DataSourceConfigurationSetsTable";
import { StyledTab } from "components/StyledComponents/StyledTab";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ObjectType } from "models/objectType";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import styled from "styled-components";

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
      <div>TODO: Properties</div>
      <Tabs
        activeTab={tabIndex}
        onChange={setTabIndex}
        scrollable
        style={{ whiteSpace: "nowrap" }}
      >
        <Tabs.List>
          <StyledTab colors={colors}>Configuration sets</StyledTab>
          <StyledTab colors={colors}>Contacts</StyledTab>
        </Tabs.List>
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
