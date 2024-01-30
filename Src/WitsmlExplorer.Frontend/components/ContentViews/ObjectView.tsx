import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import FluidsView from "./FluidsView";
import MudLogView from "./MudLogView";
import TrajectoryView from "./TrajectoryView";
import TubularView from "./TubularView";
import WbGeometryView from "./WbGeometryView";

enum ObjectGroupUrlParams {
  MudLog = "MudLog",
  Trajectory = "Trajectory",
  Tubular = "Tubular",
  WbGeometry = "WbGeometry",
  FluidsReport = "FluidsReport"
}

const objectViews: Record<ObjectGroupUrlParams, ReactElement> = {
  [ObjectGroupUrlParams.MudLog]: <MudLogView />,
  [ObjectGroupUrlParams.Trajectory]: <TrajectoryView />,
  [ObjectGroupUrlParams.Tubular]: <TubularView />,
  [ObjectGroupUrlParams.WbGeometry]: <WbGeometryView />,
  [ObjectGroupUrlParams.FluidsReport]: <FluidsView />
};

export function ObjectView() {
  const { objectGroup } = useParams();

  const getObjectView = (objectType: string) => {
    const view = objectViews[objectType as ObjectGroupUrlParams];
    if (!view) {
      throw new Error(
        `No object view is implemented for item: ${JSON.stringify(objectType)}`
      );
    }
    return view;
  };

  return getObjectView(objectGroup);
}
