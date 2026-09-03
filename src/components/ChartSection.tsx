import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, BarChart2, Activity, Layers } from "lucide-react";
import { PredictionResult } from "../types";

interface ChartSectionProps {
  result: PredictionResult;
}

type ChartTab = "forecast" | "test_evaluation" | "technicals";

export const ChartSection: React.FC<ChartSectionProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<ChartTab>("forecast");

  // 1. Prepare Data for Forecast & History Chart
  const forecastChartData = React.useMemo(() => {
    const data: Array<{
      date: string;
      historicalClose?: number;
      forecastPrice?: number;
      lowerBound?: number;
      upperBound?: number;
      type: "history" | "forecast";
    }> = [];

    // Add recent historical points (last 45 days for focus)
    const recentHistory = result.chartHistory.slice(-45);
    recentHistory.forEach((pt) => {
      data.push({
        date: pt.date,
        historicalClose: pt.close,
        type: "history",
      });
    });

    // Bridge point: Connect last historical point to forecast
    if (recentHistory.length > 0 && result.forecast.length > 0) {
      const lastHist = recentHistory[recentHistory.length - 1];
      data[data.length - 1] = {
        ...data[data.length - 1],
        forecastPrice: lastHist.close,
        lowerBound: lastHist.close,
        upperBound: lastHist.close,
      };
    }

    // Add future forecast days
    result.forecast.forEach((fc) => {
      data.push({
        date: fc.date,
        forecastPrice: fc.predictedPrice,
        lowerBound: fc.lowerBound,
        upperBound: fc.upperBound,
        type: "forecast",
      });
    });

    return data;
  }, [result]);

  // 2. Prepare Data for Test Evaluation (Actual vs Predicted)
  const testComparisonData = React.useMemo(() => {
    return result.testComparison.map((pt) => ({
      date: pt.date,
      actualPrice: pt.actualPrice,
      predictedPrice: pt.predictedPrice,
      residual: pt.residual,
      errorPct: pt.pctError,
    }));
  }, [result.testComparison]);

  // 3. Prepare Data for Technical Indicators
  const technicalsData = React.useMemo(() => {
    return result.chartHistory.slice(-60).map((pt) => ({
      date: pt.date,
      close: pt.close,
      sma20: pt.sma20,
      sma50: pt.sma50,
      bbUpper: pt.bbUpper,
      bbLower: pt.bbLower,
      volume: pt.volume / 1000000, // in Millions
    }));
  }, [result.chartHistory]);

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-xl p-5 shadow-xs">
      {/* Chart Header & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#262626]">
        <div>
          <h2 className="text-sm font-bold text-[#e5e7eb] flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            {activeTab === "forecast" && "Historical Price & Future Machine Learning Forecast"}
            {activeTab === "test_evaluation" && "Out-of-Sample Test Evaluation: Actual vs Predicted"}
            {activeTab === "technicals" && "Technical Feature Overlays: SMA 20/50 & Bollinger Bands"}
          </h2>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {activeTab === "forecast" &&
              `Seamless transition from historical closes to ${result.metadata.forecastDays}-day forward predictions with 95% confidence bounds.`}
            {activeTab === "test_evaluation" &&
              `Model evaluated strictly on unseen chronological test split (${result.metadata.testRows} periods) with MAE: $${result.metrics.mae.toFixed(2)}.`}
            {activeTab === "technicals" &&
              "Engineered technical inputs used to train the machine learning regression model."}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-[#0f0f0f] p-1 rounded-lg border border-[#262626]">
          <button
            id="tab-forecast-btn"
            onClick={() => setActiveTab("forecast")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "forecast"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#262626]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Forecast & Bounds
          </button>
          <button
            id="tab-test-eval-btn"
            onClick={() => setActiveTab("test_evaluation")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "test_evaluation"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#262626]"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Test Set Accuracy
          </button>
          <button
            id="tab-technicals-btn"
            onClick={() => setActiveTab("technicals")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "technicals"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#262626]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Technical Indicators
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-[380px] sm:h-[420px]">
        {activeTab === "forecast" && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="date"
                stroke="#666666"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(val) => {
                  const parts = val.split("-");
                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />
              <YAxis
                stroke="#666666"
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161616",
                  borderColor: "#262626",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                  fontSize: "12px",
                  color: "#e5e7eb",
                }}
                itemStyle={{ color: "#e5e7eb" }}
                labelStyle={{ color: "#9ca3af", fontWeight: 600, marginBottom: "4px" }}
                formatter={(value: any, name: any) => {
                  if (value === undefined || value === null) return ["-", name];
                  const num = Number(value);
                  if (name === "historicalClose") return [`$${num.toFixed(2)}`, "Historical Close"];
                  if (name === "forecastPrice") return [`$${num.toFixed(2)}`, "ML Predicted Price"];
                  if (name === "upperBound") return [`$${num.toFixed(2)}`, "Upper 95% Bound"];
                  if (name === "lowerBound") return [`$${num.toFixed(2)}`, "Lower 95% Bound"];
                  return [`$${num.toFixed(2)}`, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: "#9ca3af" }} />
              {/* Shaded 95% confidence interval */}
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="transparent"
                fill="#3b82f6"
                fillOpacity={0.16}
                name="Confidence Range"
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="transparent"
                fill="#161616"
                fillOpacity={1}
                name=""
              />
              {/* Historical line */}
              <Line
                type="monotone"
                dataKey="historicalClose"
                stroke="#9ca3af"
                strokeWidth={2}
                dot={false}
                name="Historical Close"
              />
              {/* Forecast line */}
              <Line
                type="monotone"
                dataKey="forecastPrice"
                stroke="#3b82f6"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: "#3b82f6" }}
                name="Predicted Price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeTab === "test_evaluation" && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={testComparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="date"
                stroke="#666666"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(val) => {
                  const parts = val.split("-");
                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />
              <YAxis
                yAxisId="price"
                stroke="#666666"
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(val) => `$${val}`}
              />
              <YAxis
                yAxisId="residual"
                orientation="right"
                stroke="#666666"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(val) => `${val > 0 ? "+" : ""}$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161616",
                  borderColor: "#262626",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                  fontSize: "12px",
                  color: "#e5e7eb",
                }}
                itemStyle={{ color: "#e5e7eb" }}
                labelStyle={{ color: "#9ca3af", fontWeight: 600, marginBottom: "4px" }}
                formatter={(value: any, name: any) => {
                  const num = Number(value);
                  if (name === "actualPrice") return [`$${num.toFixed(2)}`, "Actual Test Price"];
                  if (name === "predictedPrice") return [`$${num.toFixed(2)}`, "Model Predicted"];
                  if (name === "residual") return [`${num > 0 ? "+" : ""}$${num.toFixed(2)}`, "Residual (Act - Pred)"];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: "#9ca3af" }} />
              {/* Residual error bars on right axis */}
              <Bar
                yAxisId="residual"
                dataKey="residual"
                fill="#262626"
                stroke="#333333"
                opacity={0.8}
                name="Residual Error ($)"
              />
              {/* Actual price line */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="actualPrice"
                stroke="#e5e7eb"
                strokeWidth={2}
                dot={{ r: 2, fill: "#e5e7eb" }}
                name="Actual Test Price"
              />
              {/* Predicted price line */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="predictedPrice"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 2, fill: "#3b82f6" }}
                name="Predicted Price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeTab === "technicals" && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={technicalsData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="date"
                stroke="#666666"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(val) => {
                  const parts = val.split("-");
                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />
              <YAxis
                yAxisId="price"
                stroke="#666666"
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(val) => `$${val}`}
              />
              <YAxis
                yAxisId="vol"
                orientation="right"
                stroke="#666666"
                domain={[0, "auto"]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(val) => `${val.toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161616",
                  borderColor: "#262626",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                  fontSize: "12px",
                  color: "#e5e7eb",
                }}
                itemStyle={{ color: "#e5e7eb" }}
                labelStyle={{ color: "#9ca3af", fontWeight: 600, marginBottom: "4px" }}
                formatter={(value: any, name: any) => {
                  if (value === null || value === undefined) return ["-", name];
                  const num = Number(value);
                  if (name === "close") return [`$${num.toFixed(2)}`, "Close Price"];
                  if (name === "sma20") return [`$${num.toFixed(2)}`, "SMA 20"];
                  if (name === "sma50") return [`$${num.toFixed(2)}`, "SMA 50"];
                  if (name === "bbUpper") return [`$${num.toFixed(2)}`, "Bollinger Upper"];
                  if (name === "bbLower") return [`$${num.toFixed(2)}`, "Bollinger Lower"];
                  if (name === "volume") return [`${num.toFixed(2)}M`, "Volume"];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: "#9ca3af" }} />
              {/* Volume */}
              <Bar
                yAxisId="vol"
                dataKey="volume"
                fill="#262626"
                stroke="#333333"
                opacity={0.8}
                name="Volume (M)"
              />
              {/* Bollinger Bands */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="bbUpper"
                stroke="#666666"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="BB Upper"
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="bbLower"
                stroke="#666666"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="BB Lower"
              />
              {/* Moving averages */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma20"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                name="SMA 20"
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma50"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={false}
                name="SMA 50"
              />
              {/* Close price */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke="#e5e7eb"
                strokeWidth={2}
                dot={false}
                name="Close Price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
