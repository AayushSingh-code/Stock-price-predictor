import React, { useState } from "react";
import {
  HelpCircle,
  Download,
  Table as TableIcon,
  BarChart3,
  SlidersHorizontal,
  CheckCircle,
} from "lucide-react";
import { PredictionResult } from "../types";

interface MetricsAndFeaturesProps {
  result: PredictionResult;
}

export const MetricsAndFeatures: React.FC<MetricsAndFeaturesProps> = ({ result }) => {
  const { metrics, featureImportances, dataTableSample, metadata, cleaningReport } = result;
  const [activeSubTab, setActiveSubTab] = useState<"metrics" | "features" | "data">("metrics");

  const downloadCleanedCsv = () => {
    if (!dataTableSample || dataTableSample.length === 0) return;
    const header = "Date,Close,SMA_20,RSI_14,MACD,Volatility_20,Target_Next_Close\n";
    const rows = dataTableSample.map(
      (r) =>
        `${r.date},${r.close},${r.sma20 ?? ""},${r.rsi14 ?? ""},${r.macd ?? ""},${r.volatility ?? ""},${r.targetNext ?? ""}`
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${metadata.ticker}_engineered_features.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-xl p-5 shadow-xs space-y-4">
      {/* Sub-Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262626] pb-3">
        <div className="flex items-center gap-1 bg-[#0f0f0f] p-1 rounded-lg border border-[#262626]">
          <button
            id="subtab-metrics-btn"
            onClick={() => setActiveSubTab("metrics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === "metrics"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#262626]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Regression Metrics
          </button>
          <button
            id="subtab-features-btn"
            onClick={() => setActiveSubTab("features")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === "features"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#262626]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Feature Importances
          </button>
          <button
            id="subtab-data-btn"
            onClick={() => setActiveSubTab("data")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === "data"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#262626]"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Engineered Dataset Table
          </button>
        </div>

        {activeSubTab === "data" && (
          <button
            onClick={downloadCleanedCsv}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#e5e7eb] bg-[#0f0f0f] border border-[#262626] hover:bg-[#262626] hover:border-[#333] rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#9ca3af]" />
            Export Features CSV
          </button>
        )}
      </div>

      {/* Tab 1: Comprehensive Regression Evaluation Metrics */}
      {activeSubTab === "metrics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* R2 Metric */}
            <div className="p-3.5 rounded-lg border border-[#262626] bg-[#121212]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e5e7eb]">R² Score (Determination)</span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {metrics.r2.toFixed(4)}
                </span>
              </div>
              <div className="w-full bg-[#262626] h-1.5 rounded-full my-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(5, Math.min(100, metrics.r2 * 100))}%` }}
                />
              </div>
              <p className="text-[11px] text-[#9ca3af]">
                Measures variance in price explained by the model compared to a naive mean baseline.
              </p>
            </div>

            {/* RMSE Metric */}
            <div className="p-3.5 rounded-lg border border-[#262626] bg-[#121212]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e5e7eb]">Root Mean Squared Error</span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  ${metrics.rmse.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-[#262626] h-1.5 rounded-full my-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: "65%" }}
                />
              </div>
              <p className="text-[11px] text-[#9ca3af]">
                Quadratic scoring metric that heavily penalizes large unexpected forecast deviations.
              </p>
            </div>

            {/* MAE Metric */}
            <div className="p-3.5 rounded-lg border border-[#262626] bg-[#121212]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e5e7eb]">Mean Absolute Error</span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  ${metrics.mae.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-[#262626] h-1.5 rounded-full my-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: "50%" }}
                />
              </div>
              <p className="text-[11px] text-[#9ca3af]">
                Average dollar divergence between actual market closing price and predicted price.
              </p>
            </div>

            {/* MAPE Metric */}
            <div className="p-3.5 rounded-lg border border-[#262626] bg-[#121212]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e5e7eb]">Mean Absolute % Error</span>
                <span className="text-xs font-mono font-bold text-green-400">
                  {metrics.mape.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-[#262626] h-1.5 rounded-full my-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(5, 100 - metrics.mape * 8)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#9ca3af]">
                Scale-independent relative error percentage across all test periods.
              </p>
            </div>

            {/* Directional Accuracy */}
            <div className="p-3.5 rounded-lg border border-[#262626] bg-[#121212]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e5e7eb]">Directional Accuracy</span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {metrics.directionalAccuracy.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-[#262626] h-1.5 rounded-full my-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${metrics.directionalAccuracy}%` }}
                />
              </div>
              <p className="text-[11px] text-[#9ca3af]">
                Percentage of test sessions where the predicted price trend (up/down) was correct.
              </p>
            </div>

            {/* Max Error */}
            <div className="p-3.5 rounded-lg border border-[#262626] bg-[#121212]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e5e7eb]">Maximum Deviation Error</span>
                <span className="text-xs font-mono font-bold text-red-400">
                  ${metrics.maxError.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-[#262626] h-1.5 rounded-full my-2 overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full transition-all"
                  style={{ width: "40%" }}
                />
              </div>
              <p className="text-[11px] text-[#9ca3af]">
                Peak tail event discrepancy observed in the out-of-sample test split.
              </p>
            </div>
          </div>

          {/* Preprocessing & Cleaning summary report */}
          <div className="p-3.5 bg-[#121212] border border-[#262626] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-[#9ca3af]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>
                <strong className="text-[#e5e7eb]">Data Preprocessing:</strong> {cleaningReport.initialRows} initial records,{" "}
                {cleaningReport.missingImputed} missing points imputed with forward-fill,{" "}
                {cleaningReport.droppedRows} initial boundary rows dropped.
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#666]">
              Model: {metadata.modelName.toUpperCase()} | Split: {metadata.trainSplit * 100}%
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Feature Importances */}
      {activeSubTab === "features" && (
        <div className="space-y-3">
          <p className="text-xs text-[#9ca3af]">
            Relative contribution of each engineered technical indicator to the trained machine
            learning regression model.
          </p>

          <div className="space-y-2.5">
            {featureImportances.map((item, idx) => {
              const pct = (item.importance * 100).toFixed(1);
              return (
                <div key={item.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#e5e7eb] flex items-center gap-2">
                      <span className="w-4 text-[#666] font-mono text-[10px]">{idx + 1}.</span>
                      {item.feature.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono font-semibold text-blue-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(3, parseFloat(pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Engineered Dataset Table */}
      {activeSubTab === "data" && (
        <div className="space-y-2">
          <p className="text-xs text-[#9ca3af]">
            Sample of recent chronological records showing computed technical indicators and
            target variables after cleaning and preprocessing.
          </p>

          <div className="overflow-x-auto border border-[#262626] rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0f0f0f] border-b border-[#262626] text-[#9ca3af]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Close ($)</th>
                  <th className="py-2.5 px-3 font-semibold">SMA 20</th>
                  <th className="py-2.5 px-3 font-semibold">RSI 14</th>
                  <th className="py-2.5 px-3 font-semibold">MACD</th>
                  <th className="py-2.5 px-3 font-semibold">Volatility</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Target Next Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626] text-[#e5e7eb]">
                {dataTableSample.map((row) => (
                  <tr key={row.date} className="hover:bg-[#1a1a1a]/80 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-[#e5e7eb]">{row.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#e5e7eb]">
                      ${row.close.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-[#9ca3af]">{row.sma20 ? `$${row.sma20.toFixed(2)}` : "-"}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={
                          row.rsi14 && row.rsi14 > 70
                            ? "text-red-400 font-semibold"
                            : row.rsi14 && row.rsi14 < 30
                            ? "text-green-400 font-semibold"
                            : "text-[#9ca3af]"
                        }
                      >
                        {row.rsi14 ? row.rsi14.toFixed(1) : "-"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#9ca3af]">{row.macd ? row.macd.toFixed(3) : "-"}</td>
                    <td className="py-2.5 px-3 text-[#9ca3af]">
                      {row.volatility ? (row.volatility * 100).toFixed(1) + "%" : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-blue-400">
                      {row.targetNext ? `$${row.targetNext.toFixed(2)}` : "Forecast Target"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
