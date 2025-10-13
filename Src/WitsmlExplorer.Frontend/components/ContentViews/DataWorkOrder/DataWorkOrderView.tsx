import DataSourceConfigurationSetsTable from "components/ContentViews/DataWorkOrder/DataSourceConfigurationSetsTable";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { ObjectType } from "models/objectType";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";

export default function DataWorkOrderView() {
  const { wellUid, wellboreUid, objectUid } = useParams();
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

  return <DataSourceConfigurationSetsTable />;
}
