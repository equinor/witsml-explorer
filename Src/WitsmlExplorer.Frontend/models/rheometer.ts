import Measure from "models/measure";

export default interface Rheometer {
  uid: string;
  tempRheom: Measure;
  presRheom: Measure;
  vis3Rpm: string;
  vis6Rpm: string;
  vis100Rpm: string;
  vis200Rpm: string;
  vis300Rpm: string;
  vis600Rpm: string;
}
