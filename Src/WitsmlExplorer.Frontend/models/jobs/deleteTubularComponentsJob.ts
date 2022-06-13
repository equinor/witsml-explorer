import TubularReference from "./tubularReference";

export default interface DeleteTubularComponentsJob {
  tubular: TubularReference;
  uids: string[];
}
