import { Button, DotProgress, Icon } from "@equinor/eds-core-react";
import { Divider, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useContext, useEffect, useState } from "react";
import styled, { CSSProp } from "styled-components";
import { FilterContext, FilterType, WellFilterType } from "../../contexts/filter";
import NavigationContext from "../../contexts/navigationContext";
import { ObjectType } from "../../models/objectType";
import NotificationService from "../../services/notificationService";
import ObjectService from "../../services/objectService";
import { colors } from "../../styles/Colors";
import Icons from "../../styles/Icons";
import { pluralize } from "../ContextMenus/ContextMenuUtils";
import FilterPanel from "./FilterPanel";

const searchOptions = Object.values(FilterType);

const SearchFilter = (): React.ReactElement => {
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer } = navigationState;
  const [selectedOption, setSelectedOption] = useState<FilterType>(selectedFilter.filterType);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [nameFilter, setNameFilter] = useState<string>(selectedFilter.name);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const FilterPopup: CSSProp = { zIndex: 10, position: "absolute", width: "inherit", top: "7rem", minWidth: "174px", paddingRight: "0.1em" };

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

  const handleOptionChange = async (event: any, newValue: FilterType) => {
    setOptionsOpen(false);
    if (event?.target.classList.contains("MuiAutocomplete-option")) {
      // Don't update option if the event is triggered by anything other than an option
      setSelectedOption(newValue);
      if (Object.values<string>(WellFilterType).includes(newValue)) {
        updateSelectedFilter({ filterType: newValue, objectsOnWellbore: [] });
      } else if (Object.values<string>(ObjectType).includes(newValue)) {
        setIsLoading(true);
        try {
          const objects = await ObjectService.getAllObjects(newValue as unknown as ObjectType);
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
    }
  };

  const handleInputChange = (event: any, newInputValue: string | null) => {
    if (event?.target?.classList && !event.target.classList.contains("MuiAutocomplete-option") && !(event.key === "Enter")) {
      // Don't update filter if the event is triggered by a change of options
      setNameFilter(newInputValue ?? "");
    }
  };

  return (
    <>
      <SearchLayout>
        <SearchBarContainer>
          <Autocomplete
            inputValue={nameFilter}
            onInputChange={handleInputChange}
            value={selectedOption}
            onChange={handleOptionChange}
            freeSolo
            disableClearable
            filterOptions={(x) => x}
            open={optionsOpen}
            options={searchOptions}
            renderOption={(option) => <OptionsLayout>{pluralize(option)}</OptionsLayout>}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={`Search ${pluralize(selectedOption)}`}
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <Button variant="ghost_icon" disabled={!selectedServer || isLoading} onClick={() => setOptionsOpen(!optionsOpen)}>
                        <Icon name={optionsOpen ? "chevronUp" : "chevronDown"} color={colors.interactive.primaryResting} />
                      </Button>
                      {isLoading && <DotProgress color={"primary"} size={32} />}
                    </>
                  ),
                  endAdornment: <Icon name="search" color={colors.interactive.primaryResting} />
                }}
              />
            )}
          />
        </SearchBarContainer>
        <Icons
          onClick={() => setExpanded(!expanded)}
          name={expanded ? "activeFilter" : "filter"}
          color={colors.interactive.primaryResting}
          size={40}
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

const SearchLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.375rem 0.5rem 1rem;
  position: relative;
`;

const SearchBarContainer = styled.div`
  width: 85%;
`;

const OptionsLayout = styled.div`
  line-height: 0.6;
  padding: 0.1rem;
  pointer-events: none;
`;

export default SearchFilter;
