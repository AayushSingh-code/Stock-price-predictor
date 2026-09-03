import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { ControlBar } from "./components/ControlBar";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { ChartSection } from "./components/ChartSection";
import { MetricsAndFeatures } from "./components/MetricsAndFeatures";
import { PythonViewerModal } from "./components/PythonViewerModal";
import { ModelType, PeriodType, PredictionResult } from "./types";
import { AlertCircle, RefreshCw, FileCode, CheckCircle2, ArrowRight } from "lucide-react";

export default function App() {
  const [ticker, setTicker] = useState<string>("AAPL");
  const [period, setPeriod] = useState<PeriodType>("1y");
  const [model, setModel] = useState<ModelType>("random_forest");
  const [days, setDays] = useState<number>(7);
  const [split, setSplit] = useState<number>(0.8);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string>("");
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>(undefined);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"code" | "logs">("code");

  const runPrediction = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          period,
          model,
          days,
          split,
          csvData: csvData || undefined,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.details || json.error || "Failed to execute machine learning model.");
      }

      setResult(json.data);
      setTerminalLogs(json.logs || "Executed successfully.");
      setExecutionTimeMs(json.executionTimeMs);
    } catch (err: any) {
      console.error("Prediction failed:", err);
      setError(err.message || "An unexpected error occurred while executing the Python ML pipeline.");
    } finally {
      setIsLoading(false);
    }
  }, [ticker, period, model, days, split, csvData]);

  // Initial fetch on mount
  useEffect(() => {
    runPrediction();
  }, []);

  const handleCsvLoaded = (data: string | null, fileName: string | null) => {
    setCsvData(data);
    setCsvFileName(fileName);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e7eb] flex flex-col font-sans">
      {/* Top Application Bar */}
      <Header
        onOpenPythonCode={() => {
          setModalTab("code");
          setIsModalOpen(true);
        }}
        onOpenTerminalLogs={() => {
          setModalTab("logs");
          setIsModalOpen(true);
        }}
        executionTimeMs={executionTimeMs}
        isRunning={isLoading}
      />

      {/* Interactive Controls & Asset Selection */}
      <ControlBar
        ticker={ticker}
        onTickerChange={(t) => setTicker(t)}
        period={period}
        onPeriodChange={(p) => setPeriod(p)}
        model={model}
        onModelChange={(m) => setModel(m)}
        days={days}
        onDaysChange={(d) => setDays(d)}
        split={split}
        onSplitChange={(s) => setSplit(s)}
        csvData={csvData}
        csvFileName={csvFileName}
        onCsvLoaded={handleCsvLoaded}
        onRunPrediction={runPrediction}
        isLoading={isLoading}
      />

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-[#1e1014] border border-red-900/60 rounded-xl flex items-start justify-between gap-3 text-red-200 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-200">Python Execution Error</h3>
                <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={runPrediction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !result && (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-sm font-semibold text-[#e5e7eb]">
                Running Python Machine Learning Engine...
              </h3>
              <p className="text-xs text-[#9ca3af] max-w-md mx-auto mt-1">
                Downloading historical data for {ticker}, preprocessing technical indicators (SMA,
                EMA, RSI, MACD, Bollinger Bands), and training {model.replace("_", " ")} regressor.
              </p>
            </div>
          </div>
        )}

        {/* Main Dashboard Panes */}
        {result && (
          <div className="space-y-6">
            {/* 1. Executive Summary Cards */}
            <ExecutiveSummary result={result} />

            {/* 2. Interactive Charts (Forecast, Evaluation, Technicals) */}
            <ChartSection result={result} />

            {/* 3. Regression Evaluation & Feature Importance */}
            <MetricsAndFeatures result={result} />

            {/* Machine Learning Methodology Footer */}
            <div className="bg-[#161616] border border-[#262626] rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#9ca3af]">
              <div className="space-y-1">
                <div className="font-semibold text-[#e5e7eb] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Methodology & Time-Series Validation
                </div>
                <p className="text-[#9ca3af] max-w-2xl">
                  Historical market prices are normalized into stationary technical features and
                  returns. Models are strictly trained on chronological historical splits (no
                  shuffle) to eliminate lookahead bias. Future forecasts utilize recursive rolling
                  iterative prediction with standard-error confidence intervals.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="/api/sample-csv"
                  className="inline-flex items-center gap-1 text-[#9ca3af] hover:text-[#e5e7eb] font-medium underline underline-offset-4"
                >
                  Download Sample CSV
                </a>
                <button
                  onClick={() => {
                    setModalTab("code");
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#262626] hover:bg-[#262626] text-[#e5e7eb] font-medium transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#9ca3af]" />
                  Inspect Python Script
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Python Code & Terminal Logs Modal */}
      <PythonViewerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
        terminalLogs={terminalLogs}
        ticker={ticker}
      />
    </div>
  );
}
