import React, { useState, useEffect } from "react";
import { X, Copy, Check, Download, Terminal, Code2, Play } from "lucide-react";

interface PythonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "code" | "logs";
  terminalLogs?: string;
  ticker: string;
}

export const PythonViewerModal: React.FC<PythonViewerModalProps> = ({
  isOpen,
  onClose,
  initialTab = "code",
  terminalLogs,
  ticker,
}) => {
  const [activeTab, setActiveTab] = useState<"code" | "logs">(initialTab);
  const [code, setCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen && !code) {
      setIsLoadingCode(true);
      fetch("/api/python-code")
        .then((res) => res.json())
        .then((data) => {
          if (data.code) setCode(data.code);
        })
        .catch((err) => console.error("Failed to load python code", err))
        .finally(() => setIsLoadingCode(false));
    }
  }, [isOpen, code]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = activeTab === "code" ? code : terminalLogs || "";
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.location.href = "/api/download-script";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#0f0f0f] text-[#e5e7eb] w-full max-w-4xl h-[85vh] rounded-2xl border border-[#262626] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#262626] flex items-center justify-between bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#0a0a0a] border border-[#262626] p-0.5 rounded-lg ml-3">
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "code"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-[#9ca3af] hover:text-[#e5e7eb]"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Python Script (stock_predictor.py)
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "logs"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-[#9ca3af] hover:text-[#e5e7eb]"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Python Execution Output
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#0f0f0f] hover:bg-[#262626] text-[#e5e7eb] border border-[#262626] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#9ca3af] hover:text-white hover:bg-[#262626] transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-[#0a0a0a]">
          {activeTab === "code" && (
            <div>
              {isLoadingCode ? (
                <div className="flex items-center justify-center h-48 text-[#9ca3af] gap-2">
                  <div className="w-4 h-4 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
                  <span>Loading stock_predictor.py source...</span>
                </div>
              ) : (
                <pre className="text-[#e5e7eb] select-text whitespace-pre-wrap">{code}</pre>
              )}
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#161616] border border-[#262626] text-[#9ca3af] space-y-1">
                <div className="text-blue-400 font-bold text-[11px] flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-current" />
                  CLI Invocation Command:
                </div>
                <div className="text-[#e5e7eb] select-all font-mono text-xs">
                  python3 python/stock_predictor.py --ticker {ticker} --days 7 --model random_forest --export-json
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-[#9ca3af] mb-2 uppercase tracking-wider">
                  Standard Error / Progress Stream:
                </div>
                <pre className="p-3 rounded-lg bg-[#161616] border border-[#262626] text-blue-300 select-text whitespace-pre-wrap">
                  {terminalLogs || "No logs recorded yet. Click 'Train & Predict' to run the Python ML engine."}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#161616] border-t border-[#262626] text-xs text-[#9ca3af] flex flex-wrap items-center justify-between gap-2">
          <span>Python 3.10 • scikit-learn 1.4+ • pandas • numpy • yfinance</span>
          <span className="text-[#666]">
            Run locally: <code className="text-blue-400">python3 stock_predictor.py --help</code>
          </span>
        </div>
      </div>
    </div>
  );
};
