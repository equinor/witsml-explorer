import ObjectReferences from "models/jobs/objectReferences";
import WellboreReference from "models/jobs/wellboreReference";
import { ObjectType } from "models/objectType";
import SelectableObjectOnWellbore, {
  MixedObjectsReferences
} from "models/selectableObjectOnWellbore";
import { useEffect, useState } from "react";

export const useClipboardReferences = (
  pollInterval = 0
): ObjectReferences | null => {
  const [objectReferences, setReferences] = useState<ObjectReferences>(null);

  const tryToParseClipboardContent = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const objectReferences = parseStringToReferences(clipboardText);
      setReferences(objectReferences);
    } catch {
      //Not a valid object on the clipboard? That is fine, we won't use it.
    }
  };

  useEffect(() => {
    tryToParseClipboardContent();
    let timer: ReturnType<typeof setInterval>;
    if (pollInterval > 0) {
      timer = setInterval(tryToParseClipboardContent, pollInterval);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  return objectReferences;
};

export const useClipboardMixedObjectsReferences = (
  pollInterval = 0
): MixedObjectsReferences | null => {
  const [mixedObjectsReferences, setMixedObjectsReferences] =
    useState<MixedObjectsReferences>(null);

  const tryToParseClipboardContent = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const mixedObjectsReferences =
        parseMixedObjectsReferencesStringToReference(clipboardText);
      setMixedObjectsReferences(mixedObjectsReferences);
    } catch {
      //Not a valid object on the clipboard? That is fine, we won't use it.
    }
  };

  useEffect(() => {
    tryToParseClipboardContent();
    let timer: ReturnType<typeof setInterval>;
    if (pollInterval > 0) {
      timer = setInterval(tryToParseClipboardContent, pollInterval);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  return mixedObjectsReferences;
};

export const useClipboardReferencesOfType = (
  type: ObjectType,
  pollInterval = 0
): ObjectReferences | null => {
  const objectReferences = useClipboardReferences(pollInterval);
  return objectReferences?.objectType == type ? objectReferences : null;
};

export function parseStringToReferences(input: string): ObjectReferences {
  let jsonObject: ObjectReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (e) {
    throw new Error("Invalid input given.", e);
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}

export function parseMixedObjectsReferencesStringToReference(
  input: string
): MixedObjectsReferences {
  let jsonObject: MixedObjectsReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (e) {
    throw new Error("Invalid input given.", e);
  }
  verifyRequiredMixedObjectReferencesProperties(jsonObject);
  verifyRequiredWellboreProperties(jsonObject.wellboreReference);
  verifyRequiredSelectedObjectsProperties(jsonObject.selectedObjects);
  return jsonObject;
}

function verifyRequiredWellboreProperties(jsonObject: WellboreReference) {
  const requiredProps = [
    "wellUid",
    "wellboreUid",
    "wellName",
    "wellboreName",
    "serverUrl"
  ];
  const hasRequiredProperties = requiredProps.every((prop) =>
    Object.prototype.hasOwnProperty.call(jsonObject, prop)
  );
  if (!hasRequiredProperties) {
    throw new Error("Missing required wellbore fields.");
  }
  Object.keys(jsonObject).forEach((key) => {
    if (requiredProps.indexOf(key) < 0) {
      throw new Error(
        "Other than required properties in wellbore reference found."
      );
    }
  });
}

function verifyRequiredMixedObjectReferencesProperties(
  jsonObject: MixedObjectsReferences
) {
  const requiredProps = ["selectedObjects", "wellboreReference"];
  const hasRequiredProperties = requiredProps.every((prop) =>
    Object.prototype.hasOwnProperty.call(jsonObject, prop)
  );
  if (!hasRequiredProperties) {
    throw new Error("Missing required mixed objects references fields.");
  }
  Object.keys(jsonObject).forEach((key) => {
    if (requiredProps.indexOf(key) < 0) {
      throw new Error(
        "Other than required properties in mixed objects references found."
      );
    }
  });
}

function verifyRequiredSelectedObjectsProperties(
  jsonObject: SelectableObjectOnWellbore[]
) {
  const requiredProps = ["objectType", "LogTypeItem", "uid", "name"];

  jsonObject.forEach((element) => {
    const hasRequiredProperties = requiredProps.every((prop) =>
      Object.prototype.hasOwnProperty.call(element, prop)
    );
    if (!hasRequiredProperties) {
      throw new Error("Missing required selectable object on wellbore fields.");
    }
    Object.keys(element).forEach((key) => {
      if (requiredProps.indexOf(key) < 0) {
        throw new Error(
          "Other than required properties found in selectable object on wellbore."
        );
      }
    });
  });
}

function verifyRequiredProperties(jsonObject: ObjectReferences) {
  const requiredProps = [
    "serverUrl",
    "wellUid",
    "wellboreUid",
    "objectUids",
    "objectType",
    "wellName",
    "wellboreName",
    "names"
  ];
  const hasRequiredProperties = requiredProps.every((prop) =>
    Object.prototype.hasOwnProperty.call(jsonObject, prop)
  );
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}
