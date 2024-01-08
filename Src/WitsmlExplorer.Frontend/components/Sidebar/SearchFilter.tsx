import {
  Button,
  DotProgress,
  EdsProvider,
  Icon,
  Typography
} from "@equinor/eds-core-react";
import { Divider, TextField } from "@material-ui/core";
import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import OptionsContextMenu, {
  OptionsContextMenuProps
} from "components/ContextMenus/OptionsContextMenu";
import ConfirmModal from "components/Modals/ConfirmModal";
import FilterPanel from "components/Sidebar/FilterPanel";
import {
  FilterContext,
  FilterType,
  ObjectFilterType,
  filterTypeToProperty,
  getFilterTypeInformation,
  isObjectFilterType,
  isWellFilterType,
  isWellPropertyFilterType,
  objectFilterTypeToObjects
} from "contexts/filter";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import ObjectSearchResult from "models/objectSearchResult";
import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useRef, useState } from "react";
import NotificationService from "services/notificationService";
import ObjectService from "services/objectService";
import styled, { CSSProp } from "styled-components";
import { Colors } from "styles/Colors";
import Icons from "styles/Icons";

const searchOptions = Object.values(FilterType);

const SearchFilter = (): React.ReactElement => {
  const { dispatchOperation } = useContext(OperationContext);
  const { dispatchNavigation } = useContext(NavigationContext);
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer } = navigationState;
  const [selectedOption, setSelectedOption] = useState<FilterType>(
    selectedFilter.filterType
  );
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [nameFilter, setNameFilter] = useState<string>(selectedFilter.name);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [genericSearchResults, setGenericSearchResults] =
    useState<boolean>(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  const FilterPopup: CSSProp = {
    zIndex: 10,
    position: "absolute",
    width: "inherit",
    top: "6.3rem",
    minWidth: "174px",
    paddingRight: "0.1em"
  };

  useEffect(() => {
    const dispatch = setTimeout(() => {
      if (
        nameFilter !== selectedFilter.name &&
        !isObjectFilterType(selectedOption)
      ) {
        updateSelectedFilter({ name: nameFilter });
      }
    }, 400);
    return () => clearTimeout(dispatch);
  }, [nameFilter]);

  useEffect(() => {
    if (nameFilter === "") {
      setNameFilter(selectedFilter.name);
    }
  }, [selectedFilter.name]);

  const fetchObjects = async (fetchAllObjects: boolean) => {
    setIsLoading(true);

    const searchResults: ObjectSearchResult[] = [];
    const errors: Error[] = [];
    const objectTypes =
      objectFilterTypeToObjects[selectedOption as ObjectFilterType];
    const objectPromises = objectTypes.map(async (objectType) => {
      try {
        const objects = fetchAllObjects
          ? await ObjectService.getObjectsWithParamByType(
              objectType as ObjectType,
              filterTypeToProperty[selectedOption],
              ""
            )
          : await ObjectService.getObjectsWithParamByType(
              objectType as ObjectType,
              filterTypeToProperty[selectedOption],
              nameFilter
            );
        searchResults.push(...objects);
      } catch (error) {
        errors.push(error);
      }
    });
    await Promise.all(objectPromises);
    if (errors.length > 0) {
      if (
        errors.every((e) =>
          e.message.includes("The server does not support to select")
        )
      ) {
        showWarning(
          `${errors.join(
            "\n"
          )}\n\nThe search can still be performed by fetching all ${getListedObjects()} before filtering. This might take some time.\n\nDo you still want to proceed?`
        );
      } else {
        NotificationService.Instance.alertDispatcher.dispatch({
          serverUrl: new URL(selectedServer.url),
          message: errors.map((error) => error.message).join("\n"),
          isSuccess: false,
          severity: errors.length === objectTypes.length ? "error" : "info"
        });
      }
    }
    if (errors.length !== objectTypes.length) {
      updateSelectedFilter({
        name: nameFilter,
        filterType: selectedOption,
        searchResults
      });
      setGenericSearchResults(fetchAllObjects);
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    // This is triggered when the 'Enter' key is pressed or the search icon is clicked
    if (!isLoading) {
      updateSelectedFilter({ name: nameFilter });
      if (isObjectFilterType(selectedOption)) {
        if (!genericSearchResults) {
          const fetchAllObjects = /^$|[*?]/.test(nameFilter);
          if (fetchAllObjects) {
            showWarning(
              `The given search will fetch all ${getListedObjects()}. This might take some time.\n\nDo you still want to proceed?`
            );
            return;
          }
          await fetchObjects(false);
        }
      }
      openSearchView(selectedOption);
    }
  };

  const getListedObjects = (): string => {
    const lf = new Intl.ListFormat("en-US");
    const pluralizedObjectTypes = objectFilterTypeToObjects[
      selectedOption as ObjectFilterType
    ].map((o) => pluralize(o));
    return lf.format(pluralizedObjectTypes);
  };

  const showWarning = (warning: string) => {
    // Some searches might be slow, so warn the user first
    const confirmation = (
      <ConfirmModal
        heading={"Warning: Seach might be slow!"}
        content={
          <Typography style={{ whiteSpace: "pre-line" }}>{warning}</Typography>
        }
        onConfirm={() => {
          dispatchOperation({ type: OperationType.HideModal });
          fetchObjects(true).then(() => openSearchView(selectedOption));
        }}
        confirmColor={"danger"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: confirmation
    });
  };

  const openSearchView = (option: FilterType) => {
    if (isWellFilterType(option) || isWellPropertyFilterType(option)) {
      dispatchNavigation({
        type: NavigationType.SelectServer,
        payload: { server: selectedServer }
      });
    }
    if (isObjectFilterType(option)) {
      dispatchNavigation({
        type: NavigationType.SelectObjectOnWellboreView,
        payload: {}
      });
    }
  };

  const handleOptionChange = async (newValue: FilterType) => {
    setSelectedOption(newValue);
    updateSelectedFilter({
      name: nameFilter,
      filterType: newValue,
      searchResults: []
    });
    setGenericSearchResults(false);
    openSearchView(newValue);
  };

  const openOptions = () => {
    const contextMenuProps: OptionsContextMenuProps = {
      dispatchOperation,
      options: searchOptions,
      onOptionChange: handleOptionChange,
      getOptionInformation: getFilterTypeInformation
    };
    const textFieldRect = textFieldRef.current?.getBoundingClientRect();
    const position = {
      mouseY: textFieldRect?.bottom ?? 0,
      mouseX: textFieldRect?.left ?? 0
    };
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <OptionsContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  return (
    <>
      <SearchLayout colors={colors}>
        <SearchBarContainer>
          <EdsProvider density="compact">
            <SearchField
              value={nameFilter}
              style={{ width: "100%" }}
              onChange={(event) => setNameFilter(event.target.value ?? "")}
              id="searchField"
              ref={textFieldRef}
              variant="outlined"
              colors={colors}
              size="small"
              label={`Search ${pluralize(selectedOption)}`}
              onKeyDown={(e) => (e.key == "Enter" ? handleSearch() : null)}
              InputProps={{
                startAdornment: (
                  <SearchIconLayout>
                    <Button
                      variant="ghost_icon"
                      disabled={!selectedServer || isLoading}
                      onClick={openOptions}
                      aria-label="Show Search Options"
                    >
                      <Icon
                        name={"chevronDown"}
                        color={colors.interactive.primaryResting}
                      />
                    </Button>
                    {isLoading && (
                      <DotProgress
                        color={"primary"}
                        size={32}
                        aria-label="Loading Options"
                      />
                    )}
                  </SearchIconLayout>
                ),
                endAdornment: (
                  <SearchIconLayout>
                    {nameFilter && (
                      <Button
                        variant="ghost_icon"
                        onClick={() => setNameFilter("")}
                        aria-label="Clear"
                      >
                        <Icon
                          name={"clear"}
                          color={colors.interactive.primaryResting}
                          size={18}
                        />
                      </Button>
                    )}
                    <Button
                      variant="ghost_icon"
                      onClick={handleSearch}
                      aria-label="Search"
                    >
                      <Icon
                        name="search"
                        color={colors.interactive.primaryResting}
                      />
                    </Button>
                  </SearchIconLayout>
                ),
                classes: {
                  adornedStart: "small-padding-left",
                  adornedEnd: "small-padding-right"
                }
              }}
            />
          </EdsProvider>
        </SearchBarContainer>
        <Icons
          onClick={() => setExpanded(!expanded)}
          name={expanded ? "activeFilter" : "filter"}
          color={colors.interactive.primaryResting}
          size={32}
          style={{ cursor: "pointer" }}
        />
      </SearchLayout>
      {expanded ? (
        <div style={FilterPopup}>
          <FilterPanel />
        </div>
      ) : (
        <> </>
      )}
      <Divider key={"divider"} />
    </>
  );
};

const SearchField = styled(TextField)<{ colors: Colors }>`
  &&& > div > fieldset {
    border-color: ${(props) => props.colors.interactive.primaryResting};
  }
`;

const SearchLayout = styled.div<{ colors: Colors }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.375rem 0.5rem 1rem;
  position: relative;
  padding-right: 6px;
  border-bottom: 1px solid ${(props) => props.colors.interactive.disabledBorder};
`;

const SearchIconLayout = styled.div`
  display: flex;
  align-items: center;
`;

const SearchBarContainer = styled.div`
  width: 85%;
  .small-padding-left {
    padding-left: 4px;
  }
  .small-padding-right {
    padding-right: 4px;
  }
`;

export default SearchFilter;
