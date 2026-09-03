export type ModelType =
  | "random_forest"
  | "gradient_boosting"
  | "linear_regression"
  | "ridge"
  | "lasso";

export type PeriodType = "3mo" | "6mo" | "1y" | "2y" | "5y";

export interface ForecastDay {
  date: string;
  dayIndex: number;
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  returnPct: number;
}

export interface TestComparisonPoint {
  date: string;
  actualPrice: number;
  predictedPrice: number;
  residual: number;
  pctError: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20: number | null;
  sma50: number | null;
  bbUpper: number | null;
  bbLower: number | null;
  rsi: number | null;
}

export interface DataTableSampleRow {
  date: string;
  close: number;
  sma20: number | null;
  rsi14: number | null;
  macd: number | null;
  volatility: number | null;
  targetNext: number | null;
}

export interface PredictionMetadata {
  modelName: string;
  trainRows: number;
  testRows: number;
  totalRows: number;
  trainSplit: number;
  forecastDays: number;
  featuresCount: number;
  lastDate: string;
  currentClose: number;
  ticker: string;
  period: string;
}

export interface RegressionMetrics {
  mae: number;
  rmse: number;
  mape: number;
  r2: number;
  directionalAccuracy: number;
  maxError: number;
}

export interface PredictionSummary {
  trend: "Bullish" | "Bearish" | "Neutral";
  currentClose: number;
  nextDayPrediction: number;
  nextDayReturnPct: number;
  horizonPrediction: number;
  expectedReturnPct: number;
}

export interface CleaningReport {
  initialRows: number;
  missingImputed: number;
  droppedRows: number;
  finalRows: number;
}

export interface PredictionResult {
  metadata: PredictionMetadata;
  metrics: RegressionMetrics;
  summary: PredictionSummary;
  forecast: ForecastDay[];
  testComparison: TestComparisonPoint[];
  featureImportances: FeatureImportance[];
  chartHistory: ChartDataPoint[];
  dataTableSample: DataTableSampleRow[];
  cleaningReport: CleaningReport;
}

export interface PredictApiResponse {
  success: boolean;
  executionTimeMs: number;
  logs: string;
  data: PredictionResult;
}
