import { ContentTableRow } from "components/ContentViews/table";
import WellboreReference from "./jobs/wellboreReference";

export default interface ObjectOnWellboreForSelection extends ContentTableRow {
  objectType: string;
  logType: string;
  uid: string;
  name: string;
}

export interface ObjectsOnWellbore {
  wellboreReference: WellboreReference;
  selectedObjects: ObjectOnWellboreForSelection[];
}
