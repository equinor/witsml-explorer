import Measure from "models/measure";

export default interface StnTrajCorUsed {
  gravAxialAccelCor?: Measure;
  gravTran1AccelCor?: Measure;
  gravTran2AccelCor?: Measure;
  magAxialDrlstrCor?: Measure;
  magTran1DrlstrCor?: Measure;
  magTran2DrlstrCor?: Measure;
  sagIncCor?: Measure;
  stnMagDeclUsed?: Measure;
  stnGridCorUsed?: Measure;
  dirSensorOffset?: Measure;
}
