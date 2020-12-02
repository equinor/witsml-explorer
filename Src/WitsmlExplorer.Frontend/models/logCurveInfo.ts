export default interface LogCurveInfo {
  uid: string;
  mnemonic: string;
  minDateTimeIndex?: Date;
  minDepthIndex?: number;
  maxDateTimeIndex?: Date;
  maxDepthIndex?: number;
  classWitsml: string;
  unit: string;
  mnemAlias: string;
}
