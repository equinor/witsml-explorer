export interface LogData {
  startIndex: string;
  endIndex: string;
  curveSpecifications: CurveSpecification[];
  data: LogDataRow[];
}

export interface CurveSpecification {
  mnemonic: string;
  unit: string;
}

export interface LogDataRow {
  [key: string]: number | string | boolean;
}
