import React from 'react';
import { Upload, Download, CheckCircle2, ChevronRight, BookOpen, Info } from 'lucide-react';

const Home = ({
  uploadCSV,
  loading,
  onDownloadSample,
  onLoadSampleIntoApp,
  lastLoadInfo,
  onNavigate, // (tabId) => void
}) => {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Welcome to the Beetleweight Combat Robotics Analyzer
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Upload an NHRL-style CSV and explore performance across win rate, KO rate, points, ranks, and weapon types.
          The tool preserves your CSV data exactly as-is. “E‑Rank” is an analytical metric to compare consistency and
          stopping power (with special handling for control bots).
        </p>
      </div>

      {/* How to use */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">How to use</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2">
          <li>Click “Upload CSV” below and select your NHRL active rankings CSV.</li>
          <li>Use the global filters in the header (weapon type, min fights). They apply to all tabs.</li>
          <li>Explore:
            <span className="ml-1 underline cursor-pointer text-blue-600" onClick={() => onNavigate?.('overview')}>Overview</span>,
            <span className="ml-1 underline cursor-pointer text-blue-600" onClick={() => onNavigate?.('analysis')}>Analysis</span>,
            <span className="ml-1 underline cursor-pointer text-blue-600" onClick={() => onNavigate?.('insights')}>Insights</span>,
            <span className="ml-1 underline cursor-pointer text-blue-600" onClick={() => onNavigate?.('gallery')}>Gallery</span>.
          </li>
          <li>Tip: Control the E‑Rank behavior for control bots using the header toggle (include or ignore KO%).</li>
        </ol>

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-semibold mb-1 flex items-center gap-1"><Info className="w-4 h-4" /> CSV columns supported</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Required: Rank, Bot, Fights, W, L, % (or Winrate)</li>
            <li>Optional: Points, KOs, KO'd, WeaponType, WeaponType-specific, Rank Change</li>
            <li>Winrate and KOWinrate: either 0–1 or 0–100 are accepted</li>
          </ul>
        </div>
      </div>

      {/* Upload + sample */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Upload your CSV</h3>

        <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <label className="cursor-pointer">
            <span className="text-blue-600 hover:text-blue-500 font-medium">Click to upload CSV file</span>
            <input type="file" accept=".csv" onChange={(e) => uploadCSV(e.target.files[0])} className="hidden" />
          </label>

          {loading && (
            <div className="mt-3 text-blue-600">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="ml-2">Processing data...</span>
            </div>
          )}

          {/* Success summary appears right under the uploader */}
          {lastLoadInfo && !loading && (
            <div className="mt-5 text-left max-w-2xl mx-auto">
              <div className="flex items-start gap-3 p-3 rounded border bg-green-50 border-green-200 text-green-800">
                <CheckCircle2 className="w-5 h-5 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold">CSV loaded</div>
                  <div>
                    File: <span className="font-medium">{lastLoadInfo.fileName}</span> • Bots: <span className="font-medium">{lastLoadInfo.botCount}</span> • With weapon data: <span className="font-medium">{lastLoadInfo.withWeapons}</span> • Points column: <span className="font-medium">{lastLoadInfo.hasPoints ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => onNavigate?.('overview')}>
                      <ChevronRight className="w-3 h-3" /> Go to Overview
                    </button>
                    <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => onNavigate?.('analysis')}>
                      <ChevronRight className="w-3 h-3" /> Go to Analysis
                    </button>
                    <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => onNavigate?.('gallery')}>
                      <ChevronRight className="w-3 h-3" /> Go to Gallery
                    </button>
                    <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => onNavigate?.('insights')}>
                      <ChevronRight className="w-3 h-3" /> Go to Insights
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sample CSV actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onDownloadSample} className="text-sm inline-flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4" /> Download sample CSV
          </button>
          <button onClick={onLoadSampleIntoApp} className="text-sm inline-flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-50">
            <Upload className="w-4 h-4" /> Load sample into app
          </button>
          <a className="text-sm underline text-blue-600 px-1" href="https://wiki.nhrl.io/wiki/index.php?title=NHRL:Stats:Active-3lb" target="_blank" rel="noreferrer">
            NHRL Active Rankings
          </a>
        </div>
      </div>

      {/* FAQ / tips */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Tips and gotchas</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>If Winrate appears as 81.5 in your CSV, that’s OK — we auto-normalize 0–100 to 0–1 internally.</li>
          <li>If Points is present, Insights will show “bonus-heavy” and “points per fight” lists.</li>
          <li>Rank Change parsing supports ▲ N, ▼ N, -, and ! (rookies). We render ▲/▼ in the UI.</li>
          <li>Images are fetched from BrettZone by bot name; if an image is missing there, you may see a “No img” placeholder.</li>
        </ul>
      </div>

      {/* Credits */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Credits & Non‑Affiliation</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div>Data Source: NHRL Wiki — Active Rankings</div>
          <div>Robot Images: BrettZone NHRL Bot Database</div>
          <div className="text-xs text-gray-500">
            This tool is independent and not officially affiliated with NHRL. CSV data is not modified. E‑Rank is an analytical metric only.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;