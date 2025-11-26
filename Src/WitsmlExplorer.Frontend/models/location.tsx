import Measure from "./measure.ts";
import RefNameString from "./refNameString.tsx";

export default interface Location {
  uid: string;
  wellCrs: RefNameString;
  latitude: Measure;
  longitude: Measure;
  easting: Measure;
  northing: Measure;
  westing: Measure;
  southing: Measure;
  projectedX: Measure;
  projectedY: Measure;
  localX: Measure;
  localY: Measure;
}
