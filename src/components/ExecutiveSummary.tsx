import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Calendar,
  Database,
  BarChart2,
  Target,
  Percent,
} from "lucide-react";
import { PredictionResult } from "../types";

interface ExecutiveSummaryProps {
  result: PredictionResult;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ result }) => {
  const { summary, metrics, metadata, cleaningReport } = result;

  const isBullish = summary.trend === "Bullish";
  const isBearish = summary.trend === "Bearish";

  const trendIcon = isBullish ? (
    <TrendingUp className="w-4 h-4 text-green-400" />
  ) : isBearish ? (
    <TrendingDown className="w-4 h-4 text-red-400" />
  ) : (
    <Minus className="w-4 h-4 text-amber-400" />
  );

  const trendBadgeColor = isBullish
    ? "bg-green-500/10 text-green-400 border-green-500/20"
    : isBearish
    ? "bg-red-500/10 text-red-400 border-red-500/20"
    : "bg-amber-500/10 text-amber-400 border-amber-500/20";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Current vs Predicted Future Card */}
      <div className="bg-[#161616] border border-[#262626] rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#666]">
              {metadata.ticker} Market Price
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${trendBadgeColor}`}
            >
              {trendIcon}
              {summary.trend}
            </span>
          </div>
          <div className="text-2xl font-bold text-[#e5e7eb] tracking-tight">
            ${summary.currentClose.toFixed(2)}
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            As of last trading session ({metadata.lastDate})
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-[#262626] flex items-center justify-between text-xs">
          <span className="text-[#9ca3af]">Next Trading Day:</span>
          <span className="font-semibold text-[#e5e7eb] font-mono">
            ${summary.nextDayPrediction.toFixed(2)}{" "}
            <span
              className={
                summary.nextDayReturnPct >= 0
                  ? "text-green-400 font-medium"
                  : "text-red-400 font-medium"
              }
            >
              ({summary.nextDayReturnPct >= 0 ? "+" : ""}
              {summary.nextDayReturnPct.toFixed(2)}%)
            </span>
          </span>
        </div>
      </div>

      {/* 2. Horizon Forecast Card */}
      <div className="bg-[#161616] border border-[#262626] rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#666]">
              {metadata.forecastDays}-Day Horizon Target
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[#9ca3af]">
              <Calendar className="w-3.5 h-3.5 text-[#666]" />
              {result.forecast.length > 0 ? result.forecast[result.forecast.length - 1].date : ""}
            </span>
          </div>
          <div className="text-2xl font-bold text-[#e5e7eb] tracking-tight font-mono text-blue-400">
            ${summary.horizonPrediction.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-xs font-semibold ${
                summary.expectedReturnPct >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {summary.expectedReturnPct >= 0 ? "+" : ""}
              {summary.expectedReturnPct.toFixed(2)}% expected return
            </span>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-[#262626] flex items-center justify-between text-xs">
          <span className="text-[#9ca3af]">Confidence Bounds (95%):</span>
          <span className="font-medium text-[#e5e7eb] font-mono">
            {result.forecast.length > 0
              ? `$${result.forecast[result.forecast.length - 1].lowerBound.toFixed(0)} - $${result.forecast[result.forecast.length - 1].upperBound.toFixed(0)}`
              : "N/A"}
          </span>
        </div>
      </div>

      {/* 3. Regression Accuracy & R² Score */}
      <div className="bg-[#161616] border border-[#262626] rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#666]">
              Model Fit (R² Score)
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#0f0f0f] text-blue-400 border border-[#262626]">
              <Target className="w-3 h-3 text-blue-400" />
              R²: {metrics.r2.toFixed(4)}
            </span>
          </div>
          <div className="text-2xl font-bold text-[#e5e7eb] tracking-tight">
            {metrics.directionalAccuracy.toFixed(1)}%
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Directional Accuracy (correct trend direction)
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-[#262626] grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[#666] block">RMSE:</span>
            <span className="font-semibold text-[#e5e7eb] font-mono">${metrics.rmse.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[#666] block">MAE:</span>
            <span className="font-semibold text-[#e5e7eb] font-mono">${metrics.mae.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 4. Preprocessing & ML Pipeline Metadata */}
      <div className="bg-[#161616] border border-[#262626] rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#666]">
              ML Pipeline Status
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#0f0f0f] text-[#9ca3af] border border-[#262626]">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              Trained
            </span>
          </div>
          <div className="text-base font-semibold text-[#e5e7eb] capitalize">
            {metadata.modelName.replace("_", " ")}
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {metadata.featuresCount} engineered features • {metadata.totalRows} observations
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-[#262626] flex items-center justify-between text-xs text-[#9ca3af]">
          <span>Split: {metadata.trainRows} train / {metadata.testRows} test</span>
          <span className="text-green-400 font-medium font-mono">MAPE: {metrics.mape.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};
