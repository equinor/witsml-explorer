import { useEffect, useState } from "react";
import ObjectOnWellbore from "../models/objectOnWellbore";
import { ObjectType } from "../models/objectType";
import ObjectService from "../services/objectService";

export function useGetObjects(
  wellUid: string,
  wellboreUid: string,
  objectType: ObjectType
) {
  const [objects, setObjects] = useState<ObjectOnWellbore[]>([]);

  useEffect(() => {
    const fetchObjects = async () => {
      const objects = await ObjectService.getObjects(
        wellUid,
        wellboreUid,
        objectType
      );
      setObjects(objects);
    };
    fetchObjects();
  }, [wellUid, wellboreUid, objectType]);

  return objects;
}
