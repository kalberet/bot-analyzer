import React from 'react';
import {
  Upload,
  Download,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Info,
  Filter,
  Pin,
  Image as ImageIcon,
  PieChart,
  TrendingUp,
} from 'lucide-react';

const Home = ({
  uploadCSV,
  loading,
  onDownloadSample,
  onLoadSampleIntoApp,
  lastLoadInfo,
  onNavigate, // (tabId) => void
}) => {
  const go = (tab) => onNavigate?.(tab);

  return (
    <div className="space-y-8">
      {/* 1) Gentle intro for true beginners */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> New here? Start here.
        </h2>
        <div className="space-y-3 text-gray-700 leading-relaxed">
          <p>
            Combat robotics is a sport where teams build small armored robots with different weapon styles
            and battle in an enclosed arena. NHRL (National Havoc Robot League) runs frequent events with hundreds of bots.
          </p>
          <p>
            This tool helps you explore the performance of these bots from a CSV file (spreadsheet). You’ll
            see how often bots win, how often they win by knockout, which weapon types are common, and how each bot
            ranks. We include a friendly metric called “E‑Rank” to compare how effective bots are overall.
          </p>
        </div>
      </div>

      {/* 2) Quick Start for absolute beginners */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Quick start (2 minutes)</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2">
          <li>
            Click <span className="font-semibold">Load sample into app</span> below. This loads a demo dataset so you can look around.
          </li>
          <li>
            Click <span className="underline text-blue-600 cursor-pointer" onClick={() => go('overview')}>Overview</span> to see
            a weapon type breakdown and the top bots.
          </li>
          <li>
            Browse the <span className="underline text-blue-600 cursor-pointer" onClick={() => go('gallery')}>Gallery</span> and click a bot’s image to open detailed stats.
          </li>
          <li>
            Open <span className="underline text-blue-600 cursor-pointer" onClick={() => go('analysis')}>Analysis</span> and hover the scatter plots.
            Click the small “Pin” button in a tooltip to compare bots.
          </li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onLoadSampleIntoApp} className="text-sm inline-flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-50">
            <Upload className="w-4 h-4" /> Load sample into app
          </button>
          <button
            onClick={() => go('overview')}
            className="text-sm inline-flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-50"
          >
            <PieChart className="w-4 h-4" /> Go to Overview
          </button>
          <button
            onClick={() => go('analysis')}
            className="text-sm inline-flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-50"
          >
            <TrendingUp className="w-4 h-4" /> Go to Analysis
          </button>
          <button
            onClick={() => go('gallery')}
            className="text-sm inline-flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-50"
          >
            <ImageIcon className="w-4 h-4" /> Go to Gallery
          </button>
        </div>
      </div>

      {/* 3) Step-by-step guide */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Step‑by‑step: how to use this tool</h3>

        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <div className="space-y-2">
            <p className="font-semibold">Step 1 — Get a CSV</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use the sample (below), or download from NHRL’s Active Rankings page.</li>
              <li>The CSV must have a header row. Typical columns include Rank, Bot, Fights, W, L, %, Points, KOs, KO’d.</li>
            </ul>

            <p className="font-semibold mt-4">Step 2 — Upload the CSV</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Scroll to “Upload your CSV” below and select the file.</li>
              <li>You’ll see a green “CSV loaded” card with file name and how many bots were loaded.</li>
            </ul>

            <p className="font-semibold mt-4">Step 3 — Global filters</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                Header filters apply to the whole app:
                <span className="inline-flex items-center gap-2 ml-1">
                  <Filter className="w-4 h-4" /> Weapon Type and Min Fights.
                </span>
              </li>
              <li>Min Fights hides bots with very few matches (less reliable stats).</li>
            </ul>

            <p className="font-semibold mt-4">Step 4 — Overview tab</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>See a pie chart of weapon types and a count list beside it.</li>
              <li>View “Top 10 by Official Rank” and “Top 10 by E‑Rank”.</li>
              <li>“E‑Rank” measures overall effectiveness (win + KO). Control bots can be adjusted using the header toggle.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Step 5 — Analysis tab</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Hover points to see tooltips with image, name, ranks, record, win rates.</li>
              <li>
                Click <span className="inline-flex items-center gap-1"><Pin className="w-3 h-3" /> Pin</span> in a tooltip to “lock” a bot for comparisons across charts.
              </li>
              <li>
                Examples:
                <ul className="list-disc list-inside ml-5">
                  <li>Rank vs Winrate — do higher‑ranked bots win more?</li>
                  <li>Winrate vs KO Winrate — who are the KO artists?</li>
                  <li>Winrate vs Fights — does experience help?</li>
                  <li>Points vs Winrate — do points reflect wins?</li>
                </ul>
              </li>
            </ul>

            <p className="font-semibold mt-4">Step 6 — Gallery tab</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Browse all bots as cards with images. Use search, sort, and filters.</li>
              <li>Click a card to open a modal with more stats, rank change, and a confidence bar.</li>
            </ul>

            <p className="font-semibold mt-4">Step 7 — Insights tab</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Overperformers/Underperformers: compares E‑Rank vs Official Rank.</li>
              <li>Biggest Movers and Rookies (uses the “Rank Change” column).</li>
              <li>Points insights: “Points per Fight” and “Bonus‑heavy” (when Points are present).</li>
            </ul>

            <p className="font-semibold mt-4">Step 8 — Export (optional)</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use “CSV” in the header to download a filtered copy (original rows, unchanged).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4) Friendly glossary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">What do these terms mean?</h3>
        <div className="grid md:grid-cols-2 gap-6 text-gray-700 text-sm">
          <ul className="list-disc list-inside space-y-1">
            <li><span className="font-semibold">Winrate</span>: Wins ÷ Fights (shown as %). A measure of consistency.</li>
            <li><span className="font-semibold">KO Winrate</span>: Knockout wins ÷ Wins. A measure of stopping power.</li>
            <li><span className="font-semibold">Rank</span>: Official position from your CSV (NHRL’s ranking).</li>
            <li>
              <span className="font-semibold">E‑Rank</span>: Our effectiveness ranking (win + KO).
              Control bots can ignore KO% via the header toggle.
            </li>
            <li>
              <span className="font-semibold">Rank Change</span>: Movement since the last event (CSV symbols supported):
              <span className="ml-1">“&gt;N” up, “&lt;N” down, “-” no change, “!” first event</span>
            </li>
          </ul>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="font-semibold">Points</span>: NHRL scoring used for official rankings (wins/losses plus modifiers).</li>
            <li><span className="font-semibold">Fights</span>: Total matches a bot has had; more fights = more reliable stats.</li>
            <li><span className="font-semibold">Weapon Type</span>: General style (e.g., vertical spinner, horizontal, overhead hammer, control).</li>
            <li><span className="font-semibold">Confidence bar</span>: A quick visual showing reliability based on fight count.</li>
          </ul>
        </div>
      </div>

      {/* 5) Upload + Sample (with clear loaded state) */}
      <div className="bg-white p-6 rounded-lg shadow" id="uploader">
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

          {/* Clear success summary right under the uploader */}
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
                    <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => go('overview')}>
                      <ChevronRight className="w-3 h-3" /> Go to Overview
                    </button>
                    <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => go('analysis')}>
                      <ChevronRight className="w-3 h-3" /> Go to Analysis
                    </button>
                    <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => go('gallery')}>
                      <ChevronRight className="w-3 h-3" /> Go to Gallery
                    </button>
                    <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => go('insights')}>
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
          <a
            className="text-sm underline text-blue-600 px-1"
            href="https://wiki.nhrl.io/wiki/index.php?title=NHRL:Stats:Active-3lb"
            target="_blank"
            rel="noreferrer"
            title="Where to find official CSVs"
          >
            NHRL Active Rankings
          </a>
        </div>
      </div>

      {/* 6) Extra context for beginners */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">How NHRL points work (plain language)</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
          <li>Start with wins minus losses.</li>
          <li>New bots get a temporary penalty until they have enough fights (a minimum threshold).</li>
          <li>Upsets (beating a stronger opponent) give you bonus points; losing as the favorite costs you a bit.</li>
          <li>Reaching Semifinals and Finals gives small bonuses.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          We use the Points already in your CSV (we don’t recalculate fights). Insights can estimate how much bonus you might have, but it’s only an approximation.
        </p>
      </div>

      {/* 7) Troubleshooting for true beginners */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">If something doesn’t look right</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
          <li>Nothing shows? Load the sample first, or upload your CSV again.</li>
          <li>“Movers” empty? Make sure your CSV has a “Rank Change” column using &gt;N, &lt;N, -, or !.</li>
          <li>Weapon charts missing? Add WeaponType (and optional WeaponType‑specific) columns to your CSV.</li>
          <li>Images missing? We show “No img” if BrettZone doesn’t have a picture for that name.</li>
          <li>Still stuck? Try the sample, then compare your CSV headers to the sample’s headers.</li>
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