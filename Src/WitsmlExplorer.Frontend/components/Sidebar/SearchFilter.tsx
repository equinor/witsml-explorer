import { EdsProvider, Icon } from "@equinor/eds-core-react";
import { Divider, TextField } from "@mui/material";
import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import OptionsContextMenu, {
  OptionsContextMenuProps
} from "components/ContextMenus/OptionsContextMenu";
import FilterPanel from "components/Sidebar/FilterPanel";
import { Button } from "components/StyledComponents/Button";
import { useConnectedServer } from "contexts/connectedServerContext";
import {
  FilterContext,
  FilterType,
  getFilterTypeInformation,
  isObjectFilterType
} from "contexts/filter";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import React, { useContext, useEffect, useRef, useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import { getSearchViewPath } from "routes/utils/pathBuilder";
import styled, { CSSProp } from "styled-components";
import { Colors } from "styles/Colors";
import Icons from "styles/Icons";

const searchOptions = Object.values(FilterType);

const SearchFilter = (): React.ReactElement => {
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const { connectedServer } = useConnectedServer();
  const selectedOption = selectedFilter?.filterType;
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [nameFilter, setNameFilter] = useState<string>(selectedFilter.name);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  const openSearchView = (option: FilterType) => {
    if (isObjectFilterType(option)) {
      const searchParams = createSearchParams({
        value: nameFilter
      });
      navigate({
        pathname: getSearchViewPath(connectedServer.url, option),
        search: searchParams.toString()
      });
    }
  };

  const handleOptionChange = async (newValue: FilterType) => {
    updateSelectedFilter({
      name: "",
      filterType: newValue,
      searchResults: []
    });
    setNameFilter("");
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
              onKeyDown={(e) =>
                e.key == "Enter" ? openSearchView(selectedOption) : null
              }
              InputProps={{
                startAdornment: (
                  <SearchIconLayout>
                    <Button
                      variant="ghost_icon"
                      disabled={!connectedServer}
                      onClick={openOptions}
                      aria-label="Show Search Options"
                    >
                      <Icon
                        name={"chevronDown"}
                        color={colors.interactive.primaryResting}
                      />
                    </Button>
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
                      onClick={() => openSearchView(selectedOption)}
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
