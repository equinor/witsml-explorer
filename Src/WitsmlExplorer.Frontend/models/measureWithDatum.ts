import Measure from "models/measure";

export default interface MeasureWithDatum extends Measure {
  datum: string;
}
