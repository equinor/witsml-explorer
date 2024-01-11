import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import Tubular from "../../models/tubular";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import TubularContextMenu from "../ContextMenus/TubularContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const TubularsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWell, selectedWellbore, wells } = navigationState;
  const [tubulars, setTubulars] = useState<Tubular[]>([]);
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();

  useEffect(() => {
    if (selectedWellbore?.tubulars) {
      setTubulars(selectedWellbore.tubulars);
    }
  }, [selectedWellbore?.tubulars, wells]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    tubulars: Tubular[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: tubulars,
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <TubularContextMenu {...contextProps} />, position }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    {
      property: "typeTubularAssy",
      label: "typeTubularAssy",
      type: ContentType.String
    },
    { property: "uid", label: "uid", type: ContentType.String },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    }
  ];

  const onSelect = (tubular: any) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: {
        well: selectedWell,
        wellbore: selectedWellbore,
        object: tubular,
        objectType: ObjectType.Tubular
      }
    });
    navigate(
      `/servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        selectedWell.uid
      }/wellbores/${selectedWellbore.uid}/objectgroups/tubulars/objects/${
        tubular.uid
      }`
    );
  };

  const tubularRows = tubulars.map((tubular) => {
    return {
      ...tubular,
      dTimCreation: formatDateString(
        tubular.commonData.dTimCreation,
        timeZone,
        dateTimeFormat
      ),
      dTimLastChange: formatDateString(
        tubular.commonData.dTimLastChange,
        timeZone,
        dateTimeFormat
      ),
      id: tubular.uid
    };
  });

  return selectedWellbore && tubulars == selectedWellbore.tubulars ? (
    <ContentTable
      viewId="tubularsListView"
      columns={columns}
      data={tubularRows}
      onSelect={onSelect}
      onContextMenu={onContextMenu}
      checkableRows
      showRefresh
      downloadToCsvFileName="Tubulars"
    />
  ) : (
    <></>
  );
};

export default TubularsListView;
