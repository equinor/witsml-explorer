import Wellbore from "models/wellbore";

export default interface WellboreReference {
  wellUid: string;
  wellboreUid: string;
  wellName: string;
  wellboreName: string;
  serverUrl?: string;
}

export const toWellboreReference = (wellbore: Wellbore): WellboreReference => {
  return {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid,
    wellName: wellbore.wellName,
    wellboreName: wellbore.name
  };
};
