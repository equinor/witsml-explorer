import { Autocomplete, Button, TextField } from "@equinor/eds-core-react";
import { useContext, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import MaxLength from "../../models/maxLength";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";
import { useClipboardReferencesOfType } from "../ContextMenus/UseClipboardReferences";
import ModalDialog, { ModalContentLayout, ModalWidth } from "./ModalDialog";

export interface ObjectPickerProps {
  sourceObject: ObjectOnWellbore;
  objectType: ObjectType;
  onPicked: (targetObject: ObjectOnWellbore, targetServer: Server) => void;
}

const ObjectPickerModal = (props: ObjectPickerProps): React.ReactElement => {
  const { sourceObject, objectType, onPicked } = props;
  const {
    navigationState: { servers }
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const [targetServer, setTargetServer] = useState<Server>();
  const [wellUid, setWellUid] = useState<string>(sourceObject.wellUid);
  const [wellboreUid, setWellboreUid] = useState<string>(sourceObject.wellboreUid);
  const [objectUid, setObjectUid] = useState<string>(sourceObject.uid);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const objectReference = useClipboardReferencesOfType(objectType, 100);

  const onClear = () => {
    setWellUid("");
    setWellboreUid("");
    setObjectUid("");
  };

  const onReset = () => {
    setWellUid(sourceObject.wellUid);
    setWellboreUid(sourceObject.wellboreUid);
    setObjectUid(sourceObject.uid);
  };

  const onPaste = () => {
    setWellUid(objectReference.wellUid);
    setWellboreUid(objectReference.wellboreUid);
    setObjectUid(objectReference.objectUids[0]);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const targetObject = await ObjectService.getObjectIdOnly(wellUid, wellboreUid, objectType, objectUid, null, targetServer);
      if (targetObject?.uid === objectUid) {
        dispatchOperation({ type: OperationType.HideModal });
        onPicked(targetObject, targetServer);
      } else {
        setFetchError(`The target ${objectType} was not found`);
      }
    } catch (e) {
      setFetchError("Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalDialog
      heading={`Compare with ${objectType} ${sourceObject.name}`}
      onSubmit={onSubmit}
      confirmColor={"primary"}
      confirmDisabled={invalidUid(wellUid) || invalidUid(wellboreUid) || invalidUid(objectUid) || targetServer == null}
      confirmText={`OK`}
      showCancelButton={true}
      width={ModalWidth.MEDIUM}
      isLoading={isLoading}
      errorMessage={fetchError}
      content={
        <ModalContentLayout>
          <Autocomplete
            id="server"
            label={`Compare to server ${targetServer?.name ?? ""}`}
            options={servers}
            optionLabel={(server: Server) => server.name}
            onOptionsChange={({ selectedItems }) => {
              setTargetServer(selectedItems[0]);
            }}
            style={{
              paddingBottom: "24px"
            }}
          />
          <TextField
            id="welluid"
            label="Well UID"
            value={wellUid}
            variant={invalidUid(wellUid) ? "error" : undefined}
            helperText={invalidUid(wellUid) ? `Well UID must be 1-${MaxLength.Uid} characters` : ""}
            onChange={(e: any) => setWellUid(e.target.value)}
            style={{
              paddingBottom: invalidUid(wellUid) ? 0 : "24px"
            }}
          />
          <TextField
            id="wellboreuid"
            label="Wellbore UID"
            value={wellboreUid}
            variant={invalidUid(wellboreUid) ? "error" : undefined}
            helperText={invalidUid(wellboreUid) ? `Wellbore UID must be 1-${MaxLength.Uid} characters` : ""}
            onChange={(e: any) => setWellboreUid(e.target.value)}
            style={{
              paddingBottom: invalidUid(wellboreUid) ? 0 : "24px"
            }}
          />
          <TextField
            id="objectuid"
            label="Object UID"
            value={objectUid}
            variant={invalidUid(objectUid) ? "error" : undefined}
            helperText={invalidUid(objectUid) ? `Object UID must be 1-${MaxLength.Uid} characters` : ""}
            onChange={(e: any) => setObjectUid(e.target.value)}
            style={{
              paddingBottom: invalidUid(objectUid) ? 0 : "24px"
            }}
          />
          <div style={{ display: "flex", flexDirection: "row", gap: "1rem", paddingLeft: "0.5rem", paddingBottom: "1rem" }}>
            <Button onClick={onClear}>Clear</Button>
            <Button onClick={onReset}>Reset</Button>
            <Button onClick={onPaste} disabled={objectReference == null || objectReference.objectUids.length != 1}>
              Paste
            </Button>
          </div>
        </ModalContentLayout>
      }
    />
  );
};

const invalidUid = (uid: string) => {
  return uid == null || uid.length == 0 || uid.length > MaxLength.Uid;
};

export default ObjectPickerModal;
