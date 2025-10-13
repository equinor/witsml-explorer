import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetComponents } from "hooks/query/useGetComponents";
import { ComponentType } from "models/componentType";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";

export default function DataSourceConfigurationSetView() {
  const { wellUid, wellboreUid, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const {
    components: dataSourceConfigurationSets,
    isFetched: isFetchedDataSourceConfigurationSets
  } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.DataSourceConfigurationSet
  );

  if (isFetchedDataSourceConfigurationSets && !dataSourceConfigurationSets) {
    return (
      <ItemNotFound
        itemType={ComponentType.DataSourceConfigurationSet}
        isMultiple
      />
    );
  }

  return <div>TODO: DataSourceConfigurationSetView</div>;
}
