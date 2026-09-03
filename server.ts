import express from "express";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Middleware for parsing JSON and large payloads (e.g., CSV data)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

const PYTHON_SCRIPT_PATH = path.join(process.cwd(), "python", "stock_predictor.py");

// API 1: Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    pythonAvailable: true,
    pythonVersion: "3.10+",
    scriptExists: fs.existsSync(PYTHON_SCRIPT_PATH),
  });
});

// API 2: Curated default tickers
app.get("/api/default-tickers", (_req, res) => {
  res.json([
    { ticker: "AAPL", name: "Apple Inc.", category: "Tech & Consumer" },
    { ticker: "NVDA", name: "NVIDIA Corp.", category: "Semiconductors & AI" },
    { ticker: "MSFT", name: "Microsoft Corp.", category: "Software & Cloud" },
    { ticker: "GOOGL", name: "Alphabet Inc.", category: "Internet & Search" },
    { ticker: "AMZN", name: "Amazon.com Inc.", category: "E-Commerce & Cloud" },
    { ticker: "TSLA", name: "Tesla Inc.", category: "Automotive & Clean Tech" },
    { ticker: "SPY", name: "SPDR S&P 500 ETF", category: "Index ETF" },
    { ticker: "QQQ", name: "Invesco QQQ Trust", category: "Nasdaq-100 ETF" },
  ]);
});

// API 3: Download Python Script
app.get("/api/download-script", (_req, res) => {
  if (fs.existsSync(PYTHON_SCRIPT_PATH)) {
    res.setHeader("Content-Disposition", 'attachment; filename="stock_predictor.py"');
    res.setHeader("Content-Type", "text/x-python");
    res.sendFile(PYTHON_SCRIPT_PATH);
  } else {
    res.status(404).json({ error: "Script not found" });
  }
});

// API 4: Get Python Source Code for in-browser viewer
app.get("/api/python-code", (_req, res) => {
  try {
    if (fs.existsSync(PYTHON_SCRIPT_PATH)) {
      const code = fs.readFileSync(PYTHON_SCRIPT_PATH, "utf-8");
      res.json({ code });
    } else {
      res.status(404).json({ error: "Script file not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API 5: Sample CSV generator for testing custom uploads
app.get("/api/sample-csv", (_req, res) => {
  const header = "Date,Open,High,Low,Close,Volume\n";
  const rows = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 120);

  let currentPrice = 150.0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    // skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const dateStr = d.toISOString().split("T")[0];
    const change = (Math.random() - 0.48) * 3.5;
    currentPrice = Math.max(10, currentPrice + change);
    const open = (currentPrice + (Math.random() - 0.5) * 1.5).toFixed(2);
    const high = (Math.max(currentPrice, parseFloat(open)) + Math.random() * 2.0).toFixed(2);
    const low = (Math.min(currentPrice, parseFloat(open)) - Math.random() * 2.0).toFixed(2);
    const close = currentPrice.toFixed(2);
    const volume = Math.floor(1000000 + Math.random() * 5000000);
    rows.push(`${dateStr},${open},${high},${low},${close},${volume}`);
  }

  res.setHeader("Content-Disposition", 'attachment; filename="sample_stock_data.csv"');
  res.setHeader("Content-Type", "text/csv");
  res.send(header + rows.join("\n"));
});

// API 6: Execute Machine Learning Prediction in Python
app.post("/api/predict", async (req, res) => {
  const startTime = Date.now();
  const {
    ticker = "AAPL",
    period = "1y",
    model = "random_forest",
    days = 7,
    split = 0.8,
    csvData = null,
  } = req.body;

  let tempCsvPath: string | null = null;

  try {
    const args = [
      PYTHON_SCRIPT_PATH,
      "--model",
      String(model),
      "--days",
      String(days),
      "--split",
      String(split),
      "--export-json",
    ];

    if (csvData && typeof csvData === "string" && csvData.trim().length > 0) {
      // Save CSV to temporary file
      tempCsvPath = path.join("/tmp", `stock_upload_${Date.now()}_${Math.random().toString(36).substring(7)}.csv`);
      fs.writeFileSync(tempCsvPath, csvData, "utf-8");
      args.push("--csv", tempCsvPath);
      args.push("--ticker", "CUSTOM_CSV");
    } else {
      args.push("--ticker", String(ticker).trim().toUpperCase());
      args.push("--period", String(period));
    }

    // Execute Python ML script
    execFile("python3", args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      // Cleanup temp CSV if created
      if (tempCsvPath && fs.existsSync(tempCsvPath)) {
        try {
          fs.unlinkSync(tempCsvPath);
        } catch (_) {}
      }

      const executionDurationMs = Date.now() - startTime;

      if (error && !stdout) {
        console.error("Python execution failed:", stderr);
        return res.status(500).json({
          error: "Failed to run Python ML model",
          details: stderr || error.message,
          executionTimeMs: executionDurationMs,
        });
      }

      try {
        // Parse the stdout JSON
        const jsonStartIndex = stdout.indexOf("{");
        const jsonEndIndex = stdout.lastIndexOf("}");
        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
          throw new Error("No JSON found in Python output");
        }
        const jsonString = stdout.substring(jsonStartIndex, jsonEndIndex + 1);
        const parsedData = JSON.parse(jsonString);

        return res.json({
          success: true,
          executionTimeMs: executionDurationMs,
          logs: stderr || "Python model executed successfully.",
          data: parsedData,
        });
      } catch (parseError: any) {
        console.error("Failed to parse Python JSON output:", parseError, stdout);
        return res.status(500).json({
          error: "Failed to parse Python ML output",
          details: parseError.message,
          rawOutput: stdout.substring(0, 500),
          executionTimeMs: executionDurationMs,
        });
      }
    });
  } catch (err: any) {
    if (tempCsvPath && fs.existsSync(tempCsvPath)) {
      try {
        fs.unlinkSync(tempCsvPath);
      } catch (_) {}
    }
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Stock Price Predictor Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
