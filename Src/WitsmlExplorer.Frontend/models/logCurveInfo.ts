export default interface LogCurveInfo {
  uid: string;
  mnemonic: string;
  minDateTimeIndex?: string;
  minDepthIndex?: number;
  maxDateTimeIndex?: string;
  maxDepthIndex?: number;
  classWitsml: string;
  unit: string;
  mnemAlias: string;
}
