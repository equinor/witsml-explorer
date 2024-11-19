import { Autocomplete, TextField } from "@equinor/eds-core-react";
import { useClipboardReferencesOfType } from "components/ContextMenus/UseClipboardReferences";
import ModalDialog, {
  ModalContentLayout,
  ModalWidth
} from "components/Modals/ModalDialog";
import { Banner } from "components/StyledComponents/Banner";
import { Button } from "components/StyledComponents/Button";
import { Checkbox } from "components/StyledComponents/Checkbox";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import MaxLength from "models/maxLength";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import { ChangeEvent, useState } from "react";
import ObjectService from "services/objectService";
import styled from "styled-components";
import Icon from "styles/Icons";

export interface ObjectPickerProps {
  sourceObject: ObjectOnWellbore;
  objectType: ObjectType;
  onPicked: (
    targetObject: ObjectOnWellbore,
    targetServer: Server,
    includeIndexDuplicates?: boolean,
    compareAllLogIndexes?: boolean
  ) => void;
  includeIndexDuplicatesOption?: boolean;
  includeCompareAllLogIndexesOption?: boolean;
}

const ObjectPickerModal = ({
  sourceObject,
  objectType,
  onPicked,
  includeIndexDuplicatesOption,
  includeCompareAllLogIndexesOption
}: ObjectPickerProps): React.ReactElement => {
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();
  const [targetServer, setTargetServer] = useState<Server>();
  const [wellUid, setWellUid] = useState<string>(sourceObject.wellUid);
  const [wellboreUid, setWellboreUid] = useState<string>(
    sourceObject.wellboreUid
  );
  const [objectUid, setObjectUid] = useState<string>(sourceObject.uid);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const objectReference = useClipboardReferencesOfType(objectType, 100);
  const [checkedIncludeIndexDuplicates, setCheckedIncludeIndexDuplicates] =
    useState(false);
  const [checkedCompareAllLogIndexes, setCheckedCompareAllLogIndexes] =
    useState(false);

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
    if (objectReference.serverUrl) {
      const server = servers.find(
        (server) =>
          server.url.toLowerCase() == objectReference.serverUrl.toLowerCase()
      );
      setTargetServer(server);
    }
    setWellUid(objectReference.wellUid);
    setWellboreUid(objectReference.wellboreUid);
    setObjectUid(objectReference.objectUids[0]);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const targetObject = await ObjectService.getObjectIdOnly(
        wellUid,
        wellboreUid,
        objectType,
        objectUid,
        null,
        targetServer
      );
      if (targetObject?.uid === objectUid) {
        dispatchOperation({ type: OperationType.HideModal });
        checkedIncludeIndexDuplicates || checkedCompareAllLogIndexes
          ? onPicked(
              targetObject,
              targetServer,
              checkedIncludeIndexDuplicates,
              checkedCompareAllLogIndexes
            )
          : onPicked(targetObject, targetServer);
      } else {
        setFetchError(`The target ${objectType} was not found`);
      }
    } catch (e) {
      console.error(e);
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
      confirmDisabled={
        invalidUid(wellUid) ||
        invalidUid(wellboreUid) ||
        invalidUid(objectUid) ||
        targetServer == null
      }
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
            options={filteredServers}
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
            helperText={
              invalidUid(wellUid)
                ? `Well UID must be 1-${MaxLength.Uid} characters`
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWellUid(e.target.value)
            }
            style={{
              paddingBottom: invalidUid(wellUid) ? 0 : "24px"
            }}
          />
          <TextField
            id="wellboreuid"
            label="Wellbore UID"
            value={wellboreUid}
            variant={invalidUid(wellboreUid) ? "error" : undefined}
            helperText={
              invalidUid(wellboreUid)
                ? `Wellbore UID must be 1-${MaxLength.Uid} characters`
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWellboreUid(e.target.value)
            }
            style={{
              paddingBottom: invalidUid(wellboreUid) ? 0 : "24px"
            }}
          />
          <TextField
            id="objectuid"
            label="Object UID"
            value={objectUid}
            variant={invalidUid(objectUid) ? "error" : undefined}
            helperText={
              invalidUid(objectUid)
                ? `Object UID must be 1-${MaxLength.Uid} characters`
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setObjectUid(e.target.value)
            }
            style={{
              paddingBottom: invalidUid(objectUid) ? 0 : "24px"
            }}
          />
          <ButtonsContainer>
            <Button onClick={onClear}>Clear</Button>
            <Button onClick={onReset}>Reset</Button>
            <Button
              onClick={onPaste}
              disabled={
                objectReference == null ||
                objectReference.objectUids.length != 1
              }
            >
              Paste
            </Button>
            <>
              {includeIndexDuplicatesOption && (
                <Checkbox
                  colors={colors}
                  label="Include index duplicates"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setCheckedIncludeIndexDuplicates(e.target.checked);
                  }}
                  checked={checkedIncludeIndexDuplicates}
                />
              )}
              {objectType === ObjectType.Log &&
                includeCompareAllLogIndexesOption && (
                  <Checkbox
                    colors={colors}
                    label="Compare all log indexes"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setCheckedCompareAllLogIndexes(e.target.checked);
                    }}
                    checked={checkedCompareAllLogIndexes}
                  />
                )}
            </>
          </ButtonsContainer>
          {checkedIncludeIndexDuplicates && (
            <Banner colors={colors}>
              <Banner.Icon variant="warning">
                <Icon name="infoCircle" />
              </Banner.Icon>
              <Banner.Message>
                Include index duplicates: This option only takes effect when
                servers have different numbers of decimals. It is not
                recommended to search for index duplicates by default, as it may
                result in unnecessary mismatches. This feature should only be
                used in special cases that require investigation of anomalies in
                the index duplicates.
              </Banner.Message>
            </Banner>
          )}
          {checkedCompareAllLogIndexes && (
            <Banner colors={colors}>
              <Banner.Icon variant="warning">
                <Icon name="infoCircle" />
              </Banner.Icon>
              <Banner.Message>
                Compare all log indexes: By default, logs are compared within
                their shared log index interval. Comparing logs outside their
                shared index interval should be unnecessary.
              </Banner.Message>
            </Banner>
          )}
        </ModalContentLayout>
      }
    />
  );
};

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding-left: 0.5rem;
  padding-bottom: 1rem;
`;

const invalidUid = (uid: string) => {
  return uid == null || uid.length == 0 || uid.length > MaxLength.Uid;
};

export default ObjectPickerModal;
