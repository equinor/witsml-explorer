import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import StyledLink from "components/StyledComponents/Link";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import DataSourceConfigurationSet from "models/dataWorkOrder/dataSourceConfigurationSet";
import { ObjectType } from "models/objectType";
import { useNavigate, useParams } from "react-router-dom";
import { getComponentViewPath } from "routes/utils/pathBuilder";

export interface DataSourceConfigurationSetRow extends ContentTableRow {
  id: string;
  uid: string;
  numConfigurations: number;
  dataSourceConfigurationSet: DataSourceConfigurationSet;
}

export default function DataSourceConfigurationSetsTable() {
  const { wellUid, wellboreUid, objectUid } = useParams();
  const {
    operationState: { colors }
  } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const navigate = useNavigate();
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

  const onSelect = (row: DataSourceConfigurationSetRow) => {
    navigate(getSetPath(row.uid));
  };

  const columns: ContentTableColumn[] = [
    { property: "set", label: "Set", type: ContentType.Component },
    {
      property: "numConfigurations",
      label: "Configurations",
      type: ContentType.String
    },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const dataSourceConfigurationSetRows: DataSourceConfigurationSetRow[] =
    dataSourceConfigurationSets.map((dataSourceConfigurationSet) => {
      return {
        id: dataSourceConfigurationSet.uid,
        uid: dataSourceConfigurationSet.uid,
        numConfigurations:
          dataSourceConfigurationSet.dataSourceConfigurations?.length ?? 0,
        dataSourceConfigurationSet: dataSourceConfigurationSet,
        set: (
          <StyledLink
            to={getSetPath(dataSourceConfigurationSet.uid)}
            colors={colors}
          >
            Show Set
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
        onSelect={onSelect}
        checkableRows
        showRefresh
        downloadToCsvFileName={`DataWorkOrder_${dataWorkOrder?.name}_dataSourceConfigurationSets`}
      />
    </>
  );
}
