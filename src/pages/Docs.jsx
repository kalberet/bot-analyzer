import React from 'react';

const Docs = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">About this tool</h2>
        <p className="text-gray-700 leading-relaxed">
          This project was built to make NHRL beetleweight data more explorable for teams, fans, and analysts.
          It focuses on repeatable views—weapon breakdowns, correlations, and a gallery-grade image index—
          while preserving CSV fidelity (no mutations to your data).
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Metrics and design choices</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>E-Rank: 70% Winrate + 30% KO Winrate, to reward both consistency and stopping power.</li>
          <li>5% winrate bins: easy comparison across cohorts and skew detection.</li>
          <li>Consistent scatter tooltips (image, name, ranks, record, WR/KO): fast visual comparison.</li>
          <li>Pinning: benchmark any bot across all charts for deltas at-a-glance.</li>
          <li>Confidence bar: based on fights; lightweight proxy for sample size reliability.</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Why these charts?</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Rank vs Winrate: sanity check—do the rankings reflect performance?</li>
          <li>Winrate vs KO Winrate: style-of-play lens—grinders vs knockout artists.</li>
          <li>Winrate vs Fights: experience effects and survivorship bias.</li>
          <li>Points vs Winrate: how closely points track win performance.</li>
          <li>KO Winrate vs Fights: does experience correlate with finishing ability?</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Project log</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>v2: Rewrote with modular components, consistent tooltips, bigger gallery, overview tables.</li>
          <li>v1: Initial CSV ingestion, simple charts, basic gallery and E-Rank.</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Limitations & caveats</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>CSV is treated as ground truth; no recalculation of points without fight-by-fight context.</li>
          <li>Winrate fields can be 0–1 or 0–100; both are supported and normalized only for internal charting (original values are preserved).</li>
          <li>Weapon categorization is heuristic for the general grouping.</li>
        </ul>
      </div>

      <div className="text-xs text-gray-500">
        Independent project. Not affiliated with NHRL. Images courtesy of BrettZone where available.
      </div>
    </div>
  );
};

export default Docs;