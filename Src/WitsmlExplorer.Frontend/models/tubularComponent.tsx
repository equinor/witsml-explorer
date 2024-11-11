import Measure from "models/measure";

export default interface TubularComponent {
  uid: string;
  typeTubularComponent: string;
  sequence: number;
  description: string;
  id: Measure;
  od: Measure;
  len: Measure;
  numJointStand: number;
  wtPerLen: Measure;
  configCon: string;
  typeMaterial: string;
  vendor: string;
  model: string;
}
