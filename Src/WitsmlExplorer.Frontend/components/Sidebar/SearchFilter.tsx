import { Button, DotProgress, EdsProvider, Icon } from "@equinor/eds-core-react";
import { Divider, TextField } from "@material-ui/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import styled, { CSSProp } from "styled-components";
import { FilterContext, FilterType, WellFilterType } from "../../contexts/filter";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import NotificationService from "../../services/notificationService";
import ObjectService from "../../services/objectService";
import { Colors } from "../../styles/Colors";
import Icons from "../../styles/Icons";
import { pluralize } from "../ContextMenus/ContextMenuUtils";
import OptionsContextMenu, { OptionsContextMenuProps } from "../ContextMenus/OptionsContextMenu";
import FilterPanel from "./FilterPanel";

const searchOptions = Object.values(FilterType);

const SearchFilter = (): React.ReactElement => {
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer } = navigationState;
  const [selectedOption, setSelectedOption] = useState<FilterType>(selectedFilter.filterType);
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [nameFilter, setNameFilter] = useState<string>(selectedFilter.name);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  const FilterPopup: CSSProp = { zIndex: 10, position: "absolute", width: "inherit", top: "6.3rem", minWidth: "174px", paddingRight: "0.1em" };

  useEffect(() => {
    const dispatch = setTimeout(() => {
      if (nameFilter !== selectedFilter.name) {
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

  const handleOptionChange = async (newValue: FilterType) => {
    setSelectedOption(newValue);
    if (Object.values<string>(WellFilterType).includes(newValue)) {
      updateSelectedFilter({ filterType: newValue, objectsOnWellbore: [] });
    } else if (Object.values<string>(ObjectType).includes(newValue)) {
      setIsLoading(true);
      try {
        const objects = await ObjectService.getObjectsByType(newValue as unknown as ObjectType);
        updateSelectedFilter({ filterType: newValue, objectsOnWellbore: objects });
      } catch (error) {
        NotificationService.Instance.alertDispatcher.dispatch({
          serverUrl: new URL(selectedServer.url),
          message: error.message,
          isSuccess: false
        });
      }
      setIsLoading(false);
    }
  };

  const openOptions = () => {
    const contextMenuProps: OptionsContextMenuProps = { dispatchOperation, options: searchOptions, onOptionChange: handleOptionChange };
    const textFieldRect = textFieldRef.current?.getBoundingClientRect();
    const position = {
      mouseY: textFieldRect?.bottom ?? 0,
      mouseX: textFieldRect?.left ?? 0
    };
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <OptionsContextMenu {...contextMenuProps} />, position } });
  };

  return (
    <>
      <SearchLayout colors={colors}>
        <SearchBarContainer>
          <EdsProvider density="compact">
            <TextField
              value={nameFilter}
              style={{ width: "100%" }}
              onChange={(event) => setNameFilter(event.target.value ?? "")}
              id="searchField"
              ref={textFieldRef}
              variant="outlined"
              size="small"
              label={`Search ${pluralize(selectedOption)}`}
              InputProps={{
                startAdornment: (
                  <SearchIconLayout>
                    <Button variant="ghost_icon" disabled={!selectedServer || isLoading} onClick={openOptions}>
                      <Icon name={"chevronDown"} color={colors.interactive.primaryResting} />
                    </Button>
                    {isLoading && <DotProgress color={"primary"} size={32} />}
                  </SearchIconLayout>
                ),
                endAdornment: (
                  <SearchIconLayout>
                    {nameFilter && (
                      <Button variant="ghost_icon" onClick={() => setNameFilter("")}>
                        <Icon name={"clear"} color={colors.interactive.primaryResting} size={18} />
                      </Button>
                    )}
                    <Icon name="search" color={colors.interactive.primaryResting} />
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
