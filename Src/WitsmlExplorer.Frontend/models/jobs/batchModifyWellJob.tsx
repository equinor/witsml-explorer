import { WellRow } from "components/ContentViews/WellsListView";
import { validText, validTimeZone } from "components/Modals/ModalParts";
import Well from "models/well";

export default interface BatchModifyWellJob {
  wells: Well[];
}

export const createBatchModifyWellJob = (
  editedWell: Well,
  wellRows: WellRow[]
): Well[] =>
  wellRows.map((wellRow: WellRow) => {
    return {
      uid: wellRow.uid,
      name: wellRow.name,
      field: validText(editedWell.field) ? editedWell.field : wellRow.field,
      country: validText(editedWell.country)
        ? editedWell.country
        : wellRow.country,
      operator: validText(editedWell.operator)
        ? editedWell.operator
        : wellRow.operator,
      timeZone: validTimeZone(editedWell.timeZone)
        ? editedWell.timeZone
        : wellRow.timeZone
    };
  });
