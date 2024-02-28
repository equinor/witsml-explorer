import ConfirmModal from "components/Modals/ConfirmModal";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";

export function displayReplaceModal(
  existingObjects: any[],
  objectsToCopy: any[],
  toCopyType: string,
  targetType: string,
  dispatchOperation: DispatchOperation,
  onConfirm: () => void,
  printObject: (object: any) => JSX.Element
) {
  const contentIntro =
    objectsToCopy.length > 1
      ? `${existingObjects.length} out of the ${objectsToCopy.length} ${toCopyType}s to copy already`
      : `The ${toCopyType} you are trying to copy already`;
  const indexCurveInfo =
    toCopyType === ComponentType.Mnemonic
      ? " Index curves will not be deleted."
      : "";
  const content =
    existingObjects.length > 1 ? (
      <span>
        {contentIntro} exist on the target {targetType}. Do you want to delete
        and replace them?{indexCurveInfo}
        <br />
        Existing {toCopyType}s:
        {existingObjects.map((object) => printObject(object))}
      </span>
    ) : (
      <span>
        {contentIntro} exists on the target {targetType}. Do you want to delete
        and replace it?{indexCurveInfo}
        <br />
        Existing {toCopyType}:{printObject(existingObjects[0])}
      </span>
    );
  const confirmation = (
    <ConfirmModal
      heading={`Replace ${toCopyType}${existingObjects.length > 1 ? "s" : ""}?`}
      content={content}
      onConfirm={onConfirm}
      confirmColor={"danger"}
      confirmText={`Replace ${toCopyType}${
        existingObjects.length > 1 ? "s" : ""
      }`}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: confirmation
  });
}
