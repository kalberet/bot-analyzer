import React from 'react';
import { Upload, Home as HomeIcon } from 'lucide-react';

const Home = ({ uploadCSV, loading, onDownloadSample }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <HomeIcon className="w-5 h-5" /> Welcome to the Beetleweight Combat Robotics Analyzer
        </h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Combat robotics pits weaponized robots against each other in an enclosed arena.
            The National Havoc Robot League (NHRL) is one of the most active leagues, with standardized
            judging and deep competition. This tool ingests an NHRL-style CSV and lets you explore
            performance through win/KO rates, points, ranks, and trends—plus weapon-type breakdowns.
          </p>
          <p>
            What you’ll find here:
          </p>
          <ul className="list-disc list-inside">
            <li>Custom Effectiveness Rank (E-Rank) combining winrate and KO winrate</li>
            <li>Global filters for weapon type and minimum fight count</li>
            <li>Weapon distribution (general and specific), best bot per specific weapon type</li>
            <li>Winrate distribution (5% bins) and correlations across metrics</li>
            <li>Gallery with large images, sorting, filtering, and a stats modal</li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">How NHRL calculates points (summary)</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Base points: wins - losses.</li>
          <li>Rookie penalty: applied below a minimum fights threshold.</li>
          <li>Upset modifier: bonus/penalty per fight based on win% difference (with 5 virtual wins/losses added), scaled by 2.5.</li>
          <li>Finals bonus: +0.5 for Semifinals, +0.5 for Final.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          We treat the CSV “Points” as authoritative and do not recompute point components from fight-by-fight data.
        </p>
      </div>

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
          <div className="mt-3">
            <button onClick={onDownloadSample} className="text-sm border px-3 py-2 rounded-md hover:bg-gray-50">
              Download sample CSV
            </button>
            <a className="ml-2 text-sm underline text-blue-600" href="https://wiki.nhrl.io/wiki/index.php?title=NHRL:Stats:Active-3lb" target="_blank" rel="noreferrer">
              NHRL Active Rankings
            </a>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Credits & Non-Affiliation</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div>Data Source: NHRL Wiki — Active Rankings</div>
          <div>Robot Images: BrettZone NHRL Bot Database</div>
          <div className="text-xs text-gray-500">
            This tool is independent and not officially affiliated with NHRL. CSV data is not modified. E-Rank is an analytical metric only.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;