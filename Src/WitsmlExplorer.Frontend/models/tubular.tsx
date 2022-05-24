import TubularComponent from "./tubularComponent";
import Wellbore from "./wellbore";

export default interface Tubular {
  uid: string;
  wellUid: string;
  wellboreUid: string;
  name: string;
  typeTubularAssy: string;
  tubularComponents: TubularComponent[];
}

export const calculateTubularId = (tubular: Tubular): string => {
  return tubular.wellUid + tubular.wellboreUid + tubular.uid;
};

export const getTubularProperties = (tubular: Tubular, wellbore: Wellbore): Map<string, string> => {
  return new Map([
    ["Well", wellbore.wellName],
    ["UID Well", tubular.wellUid],
    ["Wellbore", wellbore.name],
    ["UID Wellbore", tubular.wellboreUid],
    ["Tubular", tubular.name]
  ]);
};
