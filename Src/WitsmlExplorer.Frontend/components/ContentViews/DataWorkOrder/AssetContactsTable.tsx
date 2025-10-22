import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetObject } from "hooks/query/useGetObject";
import { ObjectType } from "models/objectType";
import { useParams } from "react-router-dom";

export default function AssetContactsTable() {
  const { wellUid, wellboreUid, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { object: dataWorkOrder, isFetching } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.DataWorkOrder,
    objectUid
  );
  const assetContacts = dataWorkOrder?.assetContacts ?? [];

  const assetContactRows = assetContacts.map((assetContact) => {
    return {
      id: assetContact.uid,
      uid: assetContact.uid,
      name: assetContact.name,
      emailAddress: assetContact.emailAddress,
      role: assetContact.role,
      companyName: assetContact.companyName,
      phoneNum: assetContact.phoneNum,
      availability: assetContact.availability,
      timeZone: assetContact.timeZone
    };
  });

  return (
    <>
      {isFetching && (
        <ProgressSpinnerOverlay message="Fetching AssetContacts." />
      )}
      <ContentTable
        viewId="AssetContacts"
        columns={columns}
        data={assetContactRows}
        disableSearchParamsFilter
        showRefresh
        downloadToCsvFileName={`DataWorkOrder_${dataWorkOrder?.name}_AssetContacts`}
      />
    </>
  );
}

const columns: ContentTableColumn[] = [
  { property: "name", label: "name", type: ContentType.String },
  { property: "emailAddress", label: "emailAddress", type: ContentType.String },
  { property: "role", label: "role", type: ContentType.String },
  { property: "companyName", label: "companyName", type: ContentType.String },
  { property: "phoneNum", label: "phoneNum", type: ContentType.String },
  { property: "availability", label: "availability", type: ContentType.String },
  { property: "timeZone", label: "timeZone", type: ContentType.String },
  { property: "uid", label: "uid", type: ContentType.String }
];
