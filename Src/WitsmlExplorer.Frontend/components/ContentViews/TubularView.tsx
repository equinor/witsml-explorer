import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import TubularService from "../../services/tubularService";
import TubularComponent from "../../models/tubularComponent";
import NavigationContext from "../../contexts/navigationContext";

export const TubularView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedTubular } = navigationState;
  const [tubularComponents, setTubularComponents] = useState<TubularComponent[]>([]);

  useEffect(() => {
    if (selectedTubular) {
      const abortController = new AbortController();

      const getTubular = async () => {
        setTubularComponents(await TubularService.getTubularComponents(selectedTubular.wellUid, selectedTubular.wellboreUid, selectedTubular.uid, abortController.signal));
      };

      getTubular();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedTubular]);

  const columns: ContentTableColumn[] = [
    { property: "sequence", label: "Sequence", type: ContentType.Number },
    { property: "typeTubularComponent", label: "typeTubularComponent", type: ContentType.String },
    { property: "id", label: "id", type: ContentType.Number },
    { property: "od", label: "od", type: ContentType.Number },
    { property: "len", label: "len", type: ContentType.Number },
    { property: "tubularName", label: "tubularName", type: ContentType.String },
    { property: "typeTubularAssy", label: "typeTubularAssy", type: ContentType.String },
    { property: "uid", label: "Uid", type: ContentType.String }
  ];

  const tubularComponentRows = tubularComponents.map((tubularComponent) => {
    return {
      sequence: tubularComponent.sequence,
      typeTubularComponent: tubularComponent.typeTubularComponent,
      id: tubularComponent.id,
      od: tubularComponent.od,
      len: tubularComponent.len,
      tubularName: selectedTubular.name,
      typeTubularAssy: selectedTubular.typeTubularAssy,
      uid: tubularComponent.uid
    };
  });

  return selectedTubular ? <ContentTable columns={columns} data={tubularComponentRows} /> : <></>;
};

export default TubularView;
