import React, { useMemo, useState } from 'react';
import _ from 'lodash';
import { Search } from 'lucide-react';
import { GENERAL_CATEGORIES, CATEGORY_COLORS, commonLabel } from '../utils/utils';
import RankChangeChip from '../components/RankChangeChip';
import BotModal from '../components/BotModal';
import { getBotImageUrl } from '../utils/utils';

const Gallery = ({
  filteredBots,
  hasWeaponColumns,
  parseRankChange,
  effectivenessRankMap
}) => {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [density, setDensity] = useState('comfortable'); // comfortable | cozy | compact
  const [selectedGenerals, setSelectedGenerals] = useState(new Set(GENERAL_CATEGORIES));
  const [selectedSpecifics, setSelectedSpecifics] = useState(new Set());
  const [selectedBot, setSelectedBot] = useState(null);

  const specificsList = useMemo(() => {
    if (!hasWeaponColumns) return [];
    return _(filteredBots)
      .map((b) => ({ norm: b.wSpecNorm, label: b['WeaponType-specific'] }))
      .filter((x) => x.norm)
      .groupBy('norm')
      .map((arr, norm) => ({
        key: norm,
        label: commonLabel(arr.map(a => ({ 'WeaponType-specific': a.label })), 'WeaponType-specific', norm),
      }))
      .sortBy('label')
      .value();
  }, [filteredBots, hasWeaponColumns]);

  const data = useMemo(() => {
    let src = filteredBots;
    if (hasWeaponColumns) {
      src = src.filter((b) => selectedGenerals.has(b.category));
      if (selectedSpecifics.size > 0) {
        src = src.filter((b) => b.wSpecNorm && selectedSpecifics.has(b.wSpecNorm));
      }
    }
    const q = query.trim().toLowerCase();
    if (q) {
      src = src.filter(b =>
        (b.Bot || '').toLowerCase().includes(q) ||
        (b.WeaponType || '').toLowerCase().includes(q) ||
        ((b['WeaponType-specific'] || '').toLowerCase().includes(q))
      );
    }
    const arr = [...src];
    switch (sortBy) {
      case 'winrate': arr.sort((a, b) => (b.winrateNorm || 0) - (a.winrateNorm || 0) || a.Rank - b.Rank); break;
      case 'ko': arr.sort((a, b) => (b.koWinrateNorm || 0) - (a.koWinrateNorm || 0)); break;
      case 'fights': arr.sort((a, b) => b.Fights - a.Fights || a.Rank - b.Rank); break;
      case 'points': arr.sort((a, b) => (Number(b.Points) || 0) - (Number(a.Points) || 0)); break;
      case 'name': arr.sort((a, b) => (a.Bot || '').localeCompare(b.Bot || '')); break;
      case 'rank':
      default: arr.sort((a, b) => a.Rank - b.Rank); break;
    }
    return arr;
  }, [filteredBots, hasWeaponColumns, query, sortBy, selectedGenerals, selectedSpecifics]);

  const grids = {
    comfortable: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5',
    cozy: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
    compact: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3',
  };
  const aspect = {
    comfortable: 'aspect-square',
    cozy: 'aspect-[4/3]',
    compact: 'aspect-[3/2]',
  };

  return (
    <div className="space-y-4">
      {!filteredBots.length ? (
        <div className="bg-white p-8 rounded-lg shadow">No data under current filters.</div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search bots, weapon types…"
                    className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="rank">Sort: Rank</option>
                  <option value="winrate">Sort: Win Rate</option>
                  <option value="ko">Sort: KO Rate</option>
                  <option value="fights">Sort: Fights</option>
                  <option value="points">Sort: Points</option>
                  <option value="name">Sort: Name</option>
                </select>

                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                  title="Card density"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="cozy">Cozy</option>
                  <option value="compact">Compact</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                {data.length} bots shown{query ? ` — matching "${query}"` : ''}
              </div>
            </div>

            {hasWeaponColumns && (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">General categories</p>
                  <div className="flex flex-wrap gap-2">
                    {GENERAL_CATEGORIES.map((cat) => {
                      const checked = selectedGenerals.has(cat);
                      return (
                        <label key={cat} className={`text-xs px-2 py-1 rounded border cursor-pointer select-none ${checked ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white'}`}>
                          <input
                            type="checkbox"
                            className="mr-1 align-middle"
                            checked={checked}
                            onChange={() => {
                              const next = new Set(selectedGenerals);
                              if (checked) next.delete(cat);
                              else next.add(cat);
                              setSelectedGenerals(next);
                            }}
                          />
                          {cat[0].toUpperCase() + cat.slice(1)}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Specific weapon types</p>
                    <div className="space-x-2">
                      <button className="text-xs underline text-gray-600" onClick={() => setSelectedSpecifics(new Set(specificsList.map((s) => s.key)))}>
                        Select all
                      </button>
                      <button className="text-xs underline text-gray-600" onClick={() => setSelectedSpecifics(new Set())}>
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {specificsList.length === 0 ? (
                      <span className="text-xs text-gray-500">None available</span>
                    ) : (
                      specificsList.map((spec) => {
                        const checked = selectedSpecifics.has(spec.key);
                        return (
                          <label key={spec.key} className={`text-xs px-2 py-1 rounded border cursor-pointer select-none ${checked ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white'}`}>
                            <input
                              type="checkbox"
                              className="mr-1 align-middle"
                              checked={checked}
                              onChange={() => {
                                const next = new Set(selectedSpecifics);
                                if (checked) next.delete(spec.key);
                                else next.add(spec.key);
                                setSelectedSpecifics(next);
                              }}
                            />
                            {spec.label}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Combat Robot Gallery</h3>

            <div className={`grid ${grids[density]}`}>
              {data.map((bot) => {
                const rc = parseRankChange(bot.RankChangeRaw);
                return (
                  <div key={bot.Bot} className="bg-white border rounded-md p-3 hover:shadow transition-shadow">
                    <div
                      className={`relative ${aspect[density]} w-full rounded-md mb-2 overflow-hidden bg-gray-50 group cursor-pointer`}
                      onClick={() => setSelectedBot(bot)}
                      title={`Open ${bot.Bot}`}
                    >
                      <img
                        src={getBotImageUrl(bot.Bot) || ''}
                        alt={bot.Bot}
                        className="block w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.src = ''; e.currentTarget.alt = 'Image failed to load'; }}
                      />
                      <div className="absolute top-1 right-1 z-20 pointer-events-none">
                        <span className="text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                          #{bot.Rank} <span className="ml-1"><RankChangeChip {...rc} /></span>
                        </span>
                      </div>
                      {hasWeaponColumns && (
                        <span className="absolute top-1 left-1 z-20 w-2.5 h-2.5 rounded-full ring-1 ring-white/70" style={{ backgroundColor: CATEGORY_COLORS[bot.category] }} />
                      )}
                    </div>

                    <h4 className="font-medium text-sm truncate">{bot.Bot}</h4>
                    <p className="text-[11px] text-gray-500 truncate">
                      {hasWeaponColumns ? `${bot.WeaponType} — ${bot['WeaponType-specific'] || '—'}` : 'Weapon: N/A'}
                    </p>

                    <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
                      <div className="text-gray-500">WR</div><div className="font-medium">{((bot.winrateNorm || 0) * 100).toFixed(0)}%</div>
                      <div className="text-gray-500">KO</div><div className="font-medium">{((bot.koWinrateNorm || 0) * 100).toFixed(0)}%</div>
                      <div className="text-gray-500">Rec</div><div className="font-medium">{bot.W}-{bot.L}</div>
                      <div className="text-gray-500">Fights</div><div className="font-medium">{bot.Fights}</div>
                      {bot.Points != null && (<><div className="text-gray-500">Points</div><div className="font-medium">{bot.Points}</div></>)}
                    </div>
                  </div>
                );
              })}
            </div>

            {data.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-8">No bots match your filters/search.</div>
            )}
          </div>

          {selectedBot && (
            <BotModal
              bot={selectedBot}
              eRank={effectivenessRankMap[selectedBot.Bot]}
              onClose={() => setSelectedBot(null)}
              parseRankChange={parseRankChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Gallery;