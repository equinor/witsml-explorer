import Measure from "./measure";

export default interface TrajectoryStation {
  uid: string;
  md: Measure;
  tvd?: Measure;
  incl?: Measure;
  azi?: Measure;
  dTimStn?: Date;
  typeTrajStation: string;
}
