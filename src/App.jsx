import React, { useMemo, useState } from 'react';
import {
  FileText, TrendingUp, Award, Zap, Home as HomeIcon, Lightbulb, Download
} from 'lucide-react';
import _ from 'lodash';
import useCSVData from './hooks/useCSVData';
import { parseRankChange as parseRC, effectivenessScore } from './utils/utils';

import Home from './pages/Home';
import Overview from './pages/Overview';
import Analysis from './pages/Analysis';
import Gallery from './pages/Gallery';
import Docs from './pages/Docs';
import Insights from './pages/Insights';
import EmptyState from './components/EmptyState';

const App = () => {
  const {
    loading,
    bots,
    uploadCSV,
    hasWeaponColumns,
    weaponTypeOptions,
    downloadFilteredAsCSV,
    downloadSample,
    loadSampleIntoApp,
    lastLoadInfo,
  } = useCSVData();

  const [activeTab, setActiveTab] = useState('home');
  const [selectedWeaponType, setSelectedWeaponType] = useState('all');
  const [minFights, setMinFights] = useState(0);
  const [pinnedBot, setPinnedBot] = useState(null);
  const [includeControlKO, setIncludeControlKO] = useState(false); // E-Rank toggle

  const filteredBots = useMemo(() => {
    let src = bots;
    if (hasWeaponColumns && selectedWeaponType !== 'all') {
      src = src.filter((b) => b.wTypeNorm === selectedWeaponType);
    }
    if (minFights > 0) {
      src = src.filter((b) => (b.Fights || 0) >= minFights);
    }
    return src;
  }, [bots, hasWeaponColumns, selectedWeaponType, minFights]);

  // E-Rank scoring respects the control KO% toggle
  const effectivenessRanked = useMemo(() => {
    const scored = filteredBots.map((b) => ({
      ...b,
      eScore: effectivenessScore(b, { includeControlKO }),
    }));
    return _.orderBy(scored, ['eScore'], ['desc']);
  }, [filteredBots, includeControlKO]);

  const effectivenessRankMap = useMemo(() => {
    const map = {};
    effectivenessRanked.forEach((b, idx) => { map[b.Bot] = idx + 1; });
    return map;
  }, [effectivenessRanked]);

  const weaponTypeLabel = useMemo(() => {
    if (!hasWeaponColumns) return 'All Bots';
    if (selectedWeaponType === 'all') return 'All Weapon Types';
    const opt = weaponTypeOptions.find((o) => o.key === selectedWeaponType);
    return opt ? opt.label : 'All Weapon Types';
  }, [selectedWeaponType, weaponTypeOptions, hasWeaponColumns]);

  const parseRankChange = (raw) => parseRC(raw);

  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'analysis', label: 'Analysis', icon: Zap },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'gallery', label: 'Gallery', icon: Award },
    { id: 'docs', label: 'Documentation', icon: Lightbulb },
  ];

  const resetAll = () => {
    setSelectedWeaponType('all');
    setMinFights(0);
    setPinnedBot(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Beetleweight Combat Robotics Analyzer</h1>
              <p className="text-sm text-gray-600">
                {bots.length
                  ? `${weaponTypeLabel} — ${filteredBots.length} shown of ${bots.length} loaded${minFights > 0 ? ` — Min fights: ${minFights}` : ''}`
                  : 'Upload CSV to begin'}
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              {hasWeaponColumns && (
                <select
                  value={selectedWeaponType}
                  onChange={(e) => setSelectedWeaponType(e.target.value)}
                  className="border rounded-md px-3 py-2 bg-white text-sm"
                  title="Filter by weapon type (global)"
                  disabled={!bots.length}
                >
                  <option value="all">All Weapon Types</option>
                  {weaponTypeOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>{opt.label} ({opt.count})</option>
                  ))}
                </select>
              )}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Min fights</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={minFights}
                  onChange={(e) => setMinFights(Math.max(0, Number(e.target.value)))}
                  className="w-20 border rounded-md px-2 py-1 text-sm"
                  disabled={!bots.length}
                />
              </div>

              {/* E-Rank toggle for control bots */}
              <label className="flex items-center gap-2 text-sm text-gray-700 border px-2 py-1 rounded-md" title="When off, control bots' E-Rank ignores KO%. When on, they use the standard 70/30 weighting.">
                <input
                  type="checkbox"
                  checked={includeControlKO}
                  onChange={(e) => setIncludeControlKO(e.target.checked)}
                />
                Include KO% for control bots in E-Rank
              </label>

              <button onClick={resetAll} className="text-sm border px-3 py-2 rounded-md hover:bg-gray-50" title="Reset filters">
                Reset
              </button>
              <button
                onClick={() => downloadFilteredAsCSV(filteredBots)}
                className="text-sm border px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
                disabled={!filteredBots.length}
                title="Download filtered CSV (unchanged rows)"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Upload CSV
                <input type="file" accept=".csv" onChange={(e) => uploadCSV(e.target.files[0])} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'home' && (
          <Home
            uploadCSV={uploadCSV}
            loading={loading}
            onDownloadSample={downloadSample}
            onLoadSampleIntoApp={loadSampleIntoApp}
            lastLoadInfo={lastLoadInfo}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'overview' && (
          <Overview
            filteredBots={filteredBots}
            hasWeaponColumns={hasWeaponColumns}
            selectedWeaponTypeKey={selectedWeaponType}
            weaponTypeOptions={weaponTypeOptions}
            parseRankChange={parseRankChange}
            effectivenessRankMap={effectivenessRankMap}
            includeControlKO={includeControlKO}
          />
        )}

        {activeTab === 'analysis' && (
          <Analysis
            filteredBots={filteredBots}
            hasWeaponColumns={hasWeaponColumns}
            effectivenessRankMap={effectivenessRankMap}
            pinnedBot={pinnedBot}
            setPinnedBot={setPinnedBot}
          />
        )}

        {activeTab === 'insights' && (
          <Insights
            filteredBots={filteredBots}
            effectivenessRankMap={effectivenessRankMap}
            parseRankChange={parseRankChange}
            includeControlKO={includeControlKO}
          />
        )}

        {activeTab === 'gallery' && (
          <Gallery
            filteredBots={filteredBots}
            hasWeaponColumns={hasWeaponColumns}
            parseRankChange={parseRankChange}
            effectivenessRankMap={effectivenessRankMap}
          />
        )}

        {activeTab === 'docs' && <Docs />}

        {activeTab !== 'home' && !bots.length && <EmptyState />}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Credits & Attribution</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-700">Data Source:</p>
              <p>
                NHRL Wiki — Active Rankings •{' '}
                <a href="https://wiki.nhrl.io/wiki/index.php?title=NHRL:Stats:Active-3lb" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  wiki.nhrl.io
                </a>
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Robot Images:</p>
              <p>
                BrettZone NHRL Bot Database •{' '}
                <a href="https://brettzone.nhrl.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  brettzone.nhrl.io
                </a>
              </p>
            </div>
            <div className="pt-3 border-t text-xs text-gray-500">
              Independent tool. Not affiliated with NHRL. CSV data is not modified. E‑Rank is analytical.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;