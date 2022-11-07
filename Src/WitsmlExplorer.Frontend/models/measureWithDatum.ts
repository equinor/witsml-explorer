import Measure from "./measure";

export default interface MeasureWithDatum extends Measure {
  datum: string;
}
