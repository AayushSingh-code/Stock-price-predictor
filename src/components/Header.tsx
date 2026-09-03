import React from "react";
import { Terminal, Download, Code2, Activity, Cpu } from "lucide-react";

interface HeaderProps {
  onOpenPythonCode: () => void;
  onOpenTerminalLogs: () => void;
  executionTimeMs?: number;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPythonCode,
  onOpenTerminalLogs,
  executionTimeMs,
  isRunning,
}) => {
  const handleDownloadScript = () => {
    window.location.href = "/api/download-script";
  };

  return (
    <header className="border-b border-[#262626] bg-[#0f0f0f]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-[#e5e7eb] tracking-tight">
                Stock Price <span className="text-blue-500">Predictor</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#161616] text-blue-400 border border-[#262626]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Python ML
              </span>
            </div>
            <p className="text-xs text-[#9ca3af]">
              Scikit-learn Regression & Technical Feature Forecasting
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {executionTimeMs !== undefined && !isRunning && (
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-[#161616] text-[#9ca3af] border border-[#262626]">
              Python runtime: {(executionTimeMs / 1000).toFixed(2)}s
            </span>
          )}

          <button
            id="view-logs-btn"
            onClick={onOpenTerminalLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#e5e7eb] bg-[#161616] border border-[#262626] hover:bg-[#262626] hover:border-[#333] transition-colors"
            title="View Python stdout and stderr logs"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Execution</span> Logs
          </button>

          <button
            id="view-code-btn"
            onClick={onOpenPythonCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#e5e7eb] bg-[#161616] border border-[#262626] hover:bg-[#262626] hover:border-[#333] transition-colors"
            title="Inspect full Python machine learning script"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            Python Code
          </button>

          <button
            id="download-script-btn"
            onClick={handleDownloadScript}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            title="Download standalone stock_predictor.py"
          >
            <Download className="w-3.5 h-3.5 text-blue-100" />
            <span className="hidden sm:inline">Download</span> .py
          </button>
        </div>
      </div>
    </header>
  );
};
