import { ObjectType, ObjectTypeToModel } from "models/objectType";
import Well from "models/well";
import Wellbore from "models/wellbore";
import JobService, { JobType } from "services/jobService";

export const orderModifyObjectOnWellboreJob = async <T extends ObjectType>(
  objectType: T,
  object: ObjectTypeToModel[T],
  updates: Partial<ObjectTypeToModel[T]>
) => {
  const modifyJob = {
    object: {
      // updates only contains modified properties, so we need to add uids for a correct reference to the object.
      uid: object.uid,
      wellUid: object.wellUid,
      wellboreUid: object.wellboreUid,
      ...updates,
      objectType: objectType
    },
    objectType: objectType
  };
  await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyJob);
};

export const orderCreateObjectOnWellboreJob = async <T extends ObjectType>(
  objectType: T,
  object: ObjectTypeToModel[T],
  updates: Partial<ObjectTypeToModel[T]>
) => {
  const createJob = {
    object: {
      ...object,
      ...updates,
      objectType: objectType
    },
    objectType: objectType
  };
  await JobService.orderJob(JobType.CreateObjectOnWellbore, createJob);
};

export const orderModifyWellJob = async (
  object: Well,
  updates: Partial<Well>
) => {
  const modifyJob = {
    well: {
      // updates only contains modified properties, so we need to add uids for a correct reference to the object.
      uid: object.uid,
      ...updates
    }
  };
  await JobService.orderJob(JobType.ModifyWell, modifyJob);
};

export const orderCreateWellJob = async (
  object: Well,
  updates: Partial<Well>
) => {
  const createJob = {
    well: {
      ...object,
      ...updates
    }
  };
  await JobService.orderJob(JobType.CreateWell, createJob);
};

export const orderModifyWellboreJob = async (
  object: Wellbore,
  updates: Partial<Wellbore>
) => {
  const modifyJob = {
    wellbore: {
      // updates only contains modified properties, so we need to add uids for a correct reference to the object.
      uid: object.uid,
      wellUid: object.wellUid,
      ...updates
    }
  };
  await JobService.orderJob(JobType.ModifyWellbore, modifyJob);
};

export const orderCreateWellboreJob = async (
  object: Wellbore,
  updates: Partial<Wellbore>
) => {
  const createJob = {
    wellbore: {
      ...object,
      ...updates
    }
  };
  await JobService.orderJob(JobType.CreateWellbore, createJob);
};
