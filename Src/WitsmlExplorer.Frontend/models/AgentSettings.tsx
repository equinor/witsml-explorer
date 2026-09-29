export interface AgentSettings {
  minimumDataQcTimeoutDefault: number;
  minimumDataQcDepthGapDefault: number;
  minimumDataQcDepthDensityDefault: number;
  minimumDataQcTimeGapDefault: number;
  minimumDataQcTimeDensityDefault: number;
  gapAnalyzerIncludeMinMaxIndexDefault: boolean;
  username?: string;
  timestamp?: string;
}
