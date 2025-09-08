import React, {
  CSSProperties,
  ChangeEvent,
  useCallback,
  useMemo,
  useState
} from "react";
import { Colors } from "../../../styles/Colors.tsx";
import styled from "styled-components";
import { TextField } from "@mui/material";
import ModalDialog from "../ModalDialog.tsx";
import { Server } from "../../../models/server.ts";
import { useGetWells } from "../../../hooks/query/useGetWells.tsx";
import { useGetWellbores } from "../../../hooks/query/useGetWellbores.tsx";
import Wellbore, {
  calculateWellboreNodeId,
  calculateWellNodeId
} from "../../../models/wellbore.tsx";
import WellWellboreTree, {
  WellboreTreeItem,
  WellTreeItem
} from "../../WellWellboreTree.tsx";
import { debounce } from "lodash";
import ProgressSpinner from "../../ProgressSpinner.tsx";
import { Autocomplete, Icon } from "@equinor/eds-core-react";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import OperationType from "../../../contexts/operationType.ts";
import Well from "../../../models/well.tsx";
import {
  GetMultiLogWizardStepModalAction,
  MultiLogWizardResult
} from "../../MultiLogUtils.tsx";
import {
  WITSML_INDEX_TYPE,
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "../../Constants.tsx";
import { useGetServers } from "../../../hooks/query/useGetServers.tsx";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "../UserCredentialsModal.tsx";
import AuthorizationService from "../../../services/authorizationService.ts";
import { LoggedInUsernamesActionType } from "../../../contexts/loggedInUsernamesReducer.tsx";
import { useLoggedInUsernames } from "../../../contexts/loggedInUsernamesContext.tsx";

export interface SelectWellboreStepModalProps {
  targetServer?: Server;
  indexType: WITSML_INDEX_TYPE;
  well?: Well;
  preselectedWellbores?: Wellbore[];
  onWizardFinish: (result?: MultiLogWizardResult) => void;
}

const SelectWellboreStepModal = (
  props: SelectWellboreStepModalProps
): React.ReactElement => {
  const {
    targetServer,
    indexType,
    well,
    preselectedWellbores,
    onWizardFinish
  } = props;
  const {
    dispatchOperation,
    operationState: { colors }
  } = useOperationState();
  const { dispatchLoggedInUsernames } = useLoggedInUsernames();
  const { servers } = useGetServers();

  const [targetServerValue, setTargetServerValue] =
    useState<Server>(targetServer);
  const [indexTypeValue, setIndexTypeValue] = useState<WITSML_INDEX_TYPE>(
    indexType ?? WITSML_INDEX_TYPE_MD
  );

  const { wells, isFetching: isFetchingWells } = useGetWells(
    targetServerValue,
    { placeholderData: [] }
  );

  const { wellbores, isFetching: isFetchingWellbores } = useGetWellbores(
    targetServerValue,
    "",
    { placeholderData: [] }
  );
  const [wellboreFilterValue, setWellboreFilterValue] = useState<string>("");
  const [expandedWellTreeItems, setExpandedWellTreeItems] = useState<string[]>(
    preselectedWellbores?.length > 0
      ? preselectedWellbores.map((wb) => calculateWellNodeId(wb.wellUid))
      : well
      ? [calculateWellNodeId(well.uid)]
      : []
  );
  const [selectedWellbores, setSelectedWellbores] = useState<Wellbore[]>([]);

  const onTargetServerChange = (targetServer: Server) => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: targetServer,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(targetServer, username);
        AuthorizationService.setSelectedServer(targetServer);
        dispatchLoggedInUsernames({
          type: LoggedInUsernamesActionType.AddLoggedInUsername,
          payload: { serverId: targetServer.id, username }
        });
        setTargetServerValue(targetServer);
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  const loadedWells = useMemo(() => {
    if (!isFetchingWells && !!wells && wells.length > 0) {
      return wells.toSorted((a, b) => a.name.localeCompare(b.name));
    } else {
      return [];
    }
  }, [wells]);

  const loadedWellbores = useMemo(() => {
    if (!isFetchingWellbores && !!wellbores && wellbores.length > 0) {
      return wellbores?.toSorted((a, b) => a.name.localeCompare(b.name));
    } else {
      return [];
    }
  }, [wellbores]);

  const treeData = useMemo(() => {
    const data: WellTreeItem[] = [];

    for (const well of loadedWells) {
      const wellboreTreeItems = loadedWellbores
        .filter((wb) => wb.wellUid == well.uid)
        .map(
          (wb) =>
            ({
              id: calculateWellboreNodeId(wb),
              name: wb.name + " {" + wb.uid + "}",
              wellbore: wb
            } as WellboreTreeItem)
        );

      if (!!wellboreTreeItems && wellboreTreeItems.length > 0) {
        const wellTreeItem: WellTreeItem = {
          id: calculateWellNodeId(well.uid),
          name: well.name,
          well: well,
          children: wellboreTreeItems
        };
        data.push(wellTreeItem);
      }
    }

    return data;
  }, [loadedWells, loadedWellbores]);

  const filteredTreeData = useMemo(() => {
    const filteredData: WellTreeItem[] = [];

    if (
      !!loadedWells &&
      loadedWells.length > 0 &&
      !!loadedWellbores &&
      loadedWellbores.length > 0
    ) {
      for (const wellItem of treeData) {
        let filteredWellboreTreeItems: WellboreTreeItem[] = [];

        if (!wellboreFilterValue || wellboreFilterValue.length == 0) {
          if (!!preselectedWellbores && preselectedWellbores.length > 0) {
            filteredWellboreTreeItems = wellItem.children.filter((wb) =>
              preselectedWellbores.some(
                (pwb) =>
                  wb.name
                    .toLocaleLowerCase()
                    .includes(pwb.name.toLocaleLowerCase()) ||
                  wb.id
                    .toLocaleLowerCase()
                    .includes(pwb.name.toLocaleLowerCase())
              )
            );
          } else if (
            !targetServer ||
            (!!well && well.uid == wellItem.well.uid)
          ) {
            filteredWellboreTreeItems = wellItem.children;
          }
        } else {
          filteredWellboreTreeItems = wellItem.children.filter(
            (wb) =>
              wb.name
                .toLocaleLowerCase()
                .includes(wellboreFilterValue.toLocaleLowerCase()) ||
              wb.id
                .toLocaleLowerCase()
                .includes(wellboreFilterValue.toLocaleLowerCase())
          );
        }

        if (
          !!filteredWellboreTreeItems &&
          filteredWellboreTreeItems.length > 0
        ) {
          const filteredWellTreeItem: WellTreeItem = {
            id: wellItem.id,
            name: wellItem.name,
            well: wellItem.well,
            children: filteredWellboreTreeItems
          };
          filteredData.push(filteredWellTreeItem);
        }
      }
      if (wellboreFilterValue?.length > 0) {
        setExpandedWellTreeItems(filteredData.map((wti) => wti.id));
      }
    }
    return filteredData;
  }, [loadedWells, loadedWellbores, wellboreFilterValue]);

  const debouncedSetWellboreFilterValue = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      setWellboreFilterValue(e.target.value);
    }, 500),
    []
  );

  const changeSelectedWellbore = (wellbore: Wellbore) => {
    if (!wellbore) {
      setSelectedWellbores([]);
      return;
    }

    setSelectedWellbores([wellbore]);
  };

  const onSubmit = async () => {
    const action = GetMultiLogWizardStepModalAction(
      {
        targetServer: targetServerValue,
        wellbores: selectedWellbores,
        indexType: indexTypeValue
      },
      onWizardFinish
    );
    dispatchOperation({ type: OperationType.HideModal });
    dispatchOperation(action);
  };

  const onCancel = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    onWizardFinish();
  };

  return (
    <>
      <ModalDialog
        heading={`MultiLog Wizard - Wellbore Selection Step`}
        confirmText={`Next`}
        content={
          isFetchingWells || isFetchingWellbores ? (
            <ProgressSpinner message="Fetching data." />
          ) : (
            <ContentLayout>
              <HeaderLayout>
                {!targetServer && (
                  <StyledAutocomplete
                    id={"targetServer"}
                    label={"Target server:"}
                    optionLabel={(s: Server) => `${s.name}`}
                    selectedOptions={[targetServerValue?.name]}
                    options={servers}
                    onOptionsChange={(changes) => {
                      onTargetServerChange(changes.selectedItems[0] as Server);
                    }}
                    style={
                      {
                        "--eds-input-background": colors.ui.backgroundDefault
                      } as CSSProperties
                    }
                    colors={colors}
                    disabled={!!targetServer}
                  />
                )}
                {!indexType && (
                  <StyledAutocomplete
                    id={"indexType"}
                    label={"Index type:"}
                    selectedOptions={[indexTypeValue]}
                    options={[
                      WITSML_INDEX_TYPE_MD,
                      WITSML_INDEX_TYPE_DATE_TIME
                    ]}
                    onOptionsChange={(changes) => {
                      setIndexTypeValue(
                        changes.selectedItems[0] as WITSML_INDEX_TYPE
                      );
                    }}
                    style={
                      {
                        "--eds-input-background": colors.ui.backgroundDefault
                      } as CSSProperties
                    }
                    colors={colors}
                    disabled={!!indexType}
                  />
                )}
              </HeaderLayout>
              <BodyLayout>
                <FilterField
                  id="wellboreFilter"
                  type="text"
                  defaultValue={wellboreFilterValue}
                  colors={colors}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    debouncedSetWellboreFilterValue(e)
                  }
                  InputProps={{
                    endAdornment: (
                      <SearchIconLayout>
                        <Icon
                          name="search"
                          color={colors.interactive.primaryResting}
                        />
                      </SearchIconLayout>
                    ),
                    classes: {
                      adornedStart: "small-padding-left",
                      adornedEnd: "small-padding-right"
                    }
                  }}
                />
                <WellWellboreTree
                  treeData={filteredTreeData}
                  expandedWells={expandedWellTreeItems}
                  onSelectedWellbore={(wellbore) =>
                    changeSelectedWellbore(wellbore)
                  }
                  onNodeToggle={(_, nodeId) => setExpandedWellTreeItems(nodeId)}
                ></WellWellboreTree>
              </BodyLayout>
            </ContentLayout>
          )
        }
        switchButtonPlaces={true}
        onSubmit={() => onSubmit()}
        onCancel={() => onCancel()}
        isLoading={isFetchingWells || isFetchingWellbores}
        confirmDisabled={
          !selectedWellbores ||
          selectedWellbores.length == 0 ||
          !indexTypeValue ||
          !targetServerValue
        }
      />
    </>
  );
};

const FilterField = styled(TextField)<{ colors: Colors }>`
  &&& > div > fieldset {
    border-color: ${(props) => props.colors.interactive.primaryResting};
  }
`;

const SearchIconLayout = styled.div`
  display: flex;
  align-items: center;
`;

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HeaderLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
`;

const BodyLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 50vh;
`;

const StyledAutocomplete = styled(Autocomplete)<{ colors: Colors }>`
  button {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  label {
    color: ${(props) => props.colors.text.staticTextLabel};
  }
  min-width: 25vw;
`;

export default SelectWellboreStepModal;
