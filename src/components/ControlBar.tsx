import React, { useState, useRef } from "react";
import { Search, Upload, Play, Sliders, FileText, CheckCircle2, X } from "lucide-react";
import { ModelType, PeriodType } from "../types";

interface ControlBarProps {
  ticker: string;
  onTickerChange: (ticker: string) => void;
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  model: ModelType;
  onModelChange: (model: ModelType) => void;
  days: number;
  onDaysChange: (days: number) => void;
  split: number;
  onSplitChange: (split: number) => void;
  csvData: string | null;
  csvFileName: string | null;
  onCsvLoaded: (data: string | null, fileName: string | null) => void;
  onRunPrediction: () => void;
  isLoading: boolean;
}

const POPULAR_TICKERS = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "AMZN", "SPY"];

const MODEL_LABELS: Record<ModelType, { label: string; desc: string }> = {
  random_forest: {
    label: "Random Forest",
    desc: "Ensemble of 120 decision trees with feature importance",
  },
  gradient_boosting: {
    label: "Gradient Boosting",
    desc: "Sequential error-reduction gradient boosting",
  },
  linear_regression: {
    label: "Linear Regression",
    desc: "Ordinary Least Squares with StandardScaler",
  },
  ridge: {
    label: "Ridge (L2)",
    desc: "L2 regularized regression to prevent overfitting",
  },
  lasso: {
    label: "Lasso (L1)",
    desc: "L1 sparse regularized regression with feature pruning",
  },
};

export const ControlBar: React.FC<ControlBarProps> = ({
  ticker,
  onTickerChange,
  period,
  onPeriodChange,
  model,
  onModelChange,
  days,
  onDaysChange,
  split,
  onSplitChange,
  csvData,
  csvFileName,
  onCsvLoaded,
  onRunPrediction,
  isLoading,
}) => {
  const [customInput, setCustomInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onCsvLoaded(null, null);
      onTickerChange(customInput.trim().toUpperCase());
      setCustomInput("");
    }
  };

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      alert("Please upload a valid CSV file containing historical price columns (Date, Open, High, Low, Close, Volume).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        onCsvLoaded(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-[#0f0f0f] border-b border-[#262626] py-4 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Main Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Ticker Selector / Input */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#666] uppercase tracking-wider">
              Asset:
            </span>
            <div className="flex items-center gap-1.5 bg-[#161616] p-1 rounded-lg border border-[#262626]">
              {POPULAR_TICKERS.map((t) => (
                <button
                  key={t}
                  id={`ticker-btn-${t}`}
                  onClick={() => {
                    onCsvLoaded(null, null);
                    onTickerChange(t);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    ticker === t && !csvData
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-[#9ca3af] hover:text-white hover:bg-[#262626]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Custom Ticker Search */}
            <form onSubmit={handleCustomSubmit} className="relative flex items-center">
              <input
                id="custom-ticker-input"
                type="text"
                placeholder="Other ticker..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-28 sm:w-32 pl-7 pr-2 py-1.5 text-xs font-medium bg-[#0a0a0a] border border-[#262626] rounded-lg text-[#e5e7eb] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase placeholder:normal-case placeholder:text-[#555]"
              />
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-2 pointer-events-none" />
            </form>

            {/* Custom CSV Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {csvData ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[120px]">{csvFileName || "Custom CSV"}</span>
                <button
                  onClick={() => onCsvLoaded(null, null)}
                  className="p-0.5 hover:bg-amber-500/20 rounded text-amber-300"
                  title="Remove custom CSV and return to ticker"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                id="upload-csv-btn"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#e5e7eb] bg-[#161616] border border-[#262626] hover:bg-[#262626] hover:border-[#333] rounded-lg transition-colors"
                title="Upload your own historical CSV"
              >
                <Upload className="w-3.5 h-3.5 text-[#9ca3af]" />
                Upload CSV
              </button>
            )}
          </div>

          {/* Model & Execution Trigger */}
          <div className="flex items-center gap-2">
            {/* Algorithm Select */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="model-select" className="text-xs font-bold text-[#666] uppercase tracking-wider">
                Model:
              </label>
              <select
                id="model-select"
                value={model}
                onChange={(e) => onModelChange(e.target.value as ModelType)}
                className="px-2.5 py-1.5 text-xs font-medium bg-[#161616] border border-[#262626] rounded-lg text-[#e5e7eb] focus:outline-none focus:border-blue-500"
              >
                {Object.entries(MODEL_LABELS).map(([key, val]) => (
                  <option key={key} value={key} className="bg-[#161616] text-[#e5e7eb]">
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced toggle */}
            <button
              id="toggle-advanced-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-1.5 rounded-lg border transition-colors ${
                showAdvanced
                  ? "bg-[#262626] border-[#333] text-blue-400"
                  : "bg-[#161616] border-[#262626] text-[#9ca3af] hover:bg-[#262626] hover:text-[#e5e7eb]"
              }`}
              title="Toggle advanced hyperparameters"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Run Button */}
            <button
              id="run-prediction-btn"
              onClick={onRunPrediction}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Training ML...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Train & Predict</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Hyperparameters & Settings Drawer */}
        {showAdvanced && (
          <div className="p-3.5 bg-[#161616] border border-[#262626] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Historical Range */}
            <div>
              <span className="font-semibold text-[#9ca3af] block mb-1.5">
                Historical Data Window:
              </span>
              <div className="flex items-center gap-1">
                {(["3mo", "6mo", "1y", "2y", "5y"] as PeriodType[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => onPeriodChange(p)}
                    className={`px-2 py-1 rounded font-medium transition-colors ${
                      period === p
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-[#0f0f0f] border border-[#262626] text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#262626]"
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Future Forecast Days */}
            <div>
              <span className="font-semibold text-[#9ca3af] block mb-1.5">
                Forecast Horizon (Days):
              </span>
              <div className="flex items-center gap-1">
                {[5, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => onDaysChange(d)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      days === d
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-[#0f0f0f] border border-[#262626] text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#262626]"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Train / Test Split */}
            <div>
              <span className="font-semibold text-[#9ca3af] block mb-1.5">
                Chronological Train/Test Split:
              </span>
              <div className="flex items-center gap-1">
                {[
                  { val: 0.7, label: "70 / 30" },
                  { val: 0.8, label: "80 / 20" },
                  { val: 0.85, label: "85 / 15" },
                ].map((s) => (
                  <button
                    key={s.val}
                    onClick={() => onSplitChange(s.val)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      split === s.val
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-[#0f0f0f] border border-[#262626] text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#262626]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Drag & Drop Overlay Zone when active */}
        {isDragging && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className="p-6 border-2 border-dashed border-blue-500 bg-blue-500/10 rounded-xl text-center"
          >
            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#e5e7eb]">
              Drop historical stock CSV here to load and train custom dataset
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
