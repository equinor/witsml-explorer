import Measure from "models/measure";

export default interface TubularComponent {
  sequence: number;
  typeTubularComponent: string;
  id: Measure;
  od: Measure;
  len: Measure;
  tubularName: string;
  typeTubularAssy: string;
  uid: string;
}
