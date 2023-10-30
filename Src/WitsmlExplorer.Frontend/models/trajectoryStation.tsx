import Measure from "./measure";

export default interface TrajectoryStation {
  uid: string;
  md: Measure;
  tvd?: Measure;
  incl?: Measure;
  azi?: Measure;
  dTimStn?: string;
  typeTrajStation: string;
  dls?: Measure;
  mtf?: Measure;
  gtf?: Measure;
  dispNs?: Measure;
  dispEw?: Measure;
  vertSect?: Measure;
}
