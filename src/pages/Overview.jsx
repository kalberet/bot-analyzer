import React, { useMemo } from 'react';
import _ from 'lodash';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip,
  BarChart, Bar, CartesianGrid, XAxis, YAxis
} from 'recharts';
import { Award, Target, Zap, TrendingUp } from 'lucide-react';
import {
  pct, commonLabel, CATEGORY_COLORS, GENERAL_CATEGORIES, winrateBuckets5
} from '../utils/utils';
import StatCard from '../components/StatCard';
import RankChangeChip from '../components/RankChangeChip';
import BotImage from '../components/BotImage';

const ControlAdjBadge = ({ bot, includeControlKO }) => {
  if (includeControlKO) return null;
  if (!bot) return null;
  const adjusted = bot.category === 'control' && !isFlamethrower(bot);
  if (!adjusted) return null;
  return (
    <span
      title="Control-adjusted E-Rank (KO% ignored)"
      className="ml-1 inline-flex items-center text-[10px] px-1.5 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-700"
    >
      CA
    </span>
  );
};

const Overview = ({
  filteredBots,
  hasWeaponColumns,
  selectedWeaponTypeKey,
  weaponTypeOptions,
  parseRankChange,
  effectivenessRankMap,
  includeControlKO, // passed for clarity; ranking already uses map
}) => {
  const avgWR = useMemo(() => _.meanBy(filteredBots, 'winrateNorm') * 100, [filteredBots]);
  const avgKO = useMemo(() => _.meanBy(filteredBots, 'koWinrateNorm') * 100, [filteredBots]);
  const totalFights = useMemo(() => _.sumBy(filteredBots, 'Fights'), [filteredBots]);

  const generalStats = useMemo(() => {
    if (!hasWeaponColumns) return [];
    const grouped = _.groupBy(filteredBots, 'wTypeNorm');
    return Object.entries(grouped)
      .map(([key, bots]) => ({ key, label: commonLabel(bots, 'WeaponType', key), count: bots.length }))
      .sort((a, b) => b.count - a.count);
  }, [filteredBots, hasWeaponColumns]);

  const specificStats = useMemo(() => {
    if (!hasWeaponColumns) return [];
    const grouped = _.groupBy(filteredBots, 'wSpecNorm');
    return Object.entries(grouped)
      .filter(([key]) => key)
      .map(([key, bots]) => ({ key, label: commonLabel(bots, 'WeaponType-specific', key), count: bots.length }))
      .sort((a, b) => b.count - a.count);
  }, [filteredBots, hasWeaponColumns]);

  const pieData = useMemo(() => {
    if (!hasWeaponColumns) return [];
    if (selectedWeaponTypeKey === 'all') return generalStats.map(g => ({ name: g.label, value: g.count, key: g.key }));
    const spec = _.groupBy(filteredBots, 'wSpecNorm');
    return Object.entries(spec)
      .filter(([key]) => key)
      .map(([key, bots]) => ({ name: commonLabel(bots, 'WeaponType-specific', key), value: bots.length, key }))
      .sort((a, b) => b.value - a.value);
  }, [filteredBots, hasWeaponColumns, selectedWeaponTypeKey, generalStats]);

  const winDist = useMemo(() => winrateBuckets5(filteredBots.map(b => ({ winrateNorm: b.winrateNorm }))), [filteredBots]);

  // Best-by-specific tables (existing)
  const bySpecific = useMemo(() => {
    if (!hasWeaponColumns) return [];
    const grouped = _.groupBy(filteredBots, 'wSpecNorm');
    return Object.entries(grouped)
      .filter(([spec]) => spec)
      .map(([spec, bots]) => {
        const label = commonLabel(bots, 'WeaponType-specific', spec);
        const bestOfficial = _.minBy(bots, 'Rank');
        const bestERank = _.minBy(bots, (b) => effectivenessRankMap[b.Bot] || Number.MAX_SAFE_INTEGER);
        return { key: spec, label, bestOfficial, bestERank };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredBots, effectivenessRankMap, hasWeaponColumns]);

  // Top lists
  const topByOfficial = useMemo(
    () => _.sortBy(filteredBots, 'Rank').slice(0, 10),
    [filteredBots]
  );
  const topByERank = useMemo(() => {
    const withER = filteredBots
      .map(b => ({ ...b, eRank: effectivenessRankMap[b.Bot] }))
      .filter(b => b.eRank != null);
    return _.sortBy(withER, 'eRank').slice(0, 10);
  }, [filteredBots, effectivenessRankMap]);

  return (
    <div className="space-y-8">
      {!filteredBots.length ? (
        <div className="bg-white p-8 rounded-lg shadow">No data under current filters.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard icon={<Award className="h-8 w-8 text-blue-600" />} label="Total Bots" value={filteredBots.length} />
            <StatCard icon={<Target className="h-8 w-8 text-green-600" />} label="Avg Win Rate" value={pct(avgWR)} />
            <StatCard icon={<Zap className="h-8 w-8 text-red-600" />} label="Avg KO Rate" value={pct(avgKO)} />
            <StatCard icon={<TrendingUp className="h-8 w-8 text-purple-600" />} label="Total Fights" value={totalFights.toLocaleString()} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">
                {hasWeaponColumns
                  ? (selectedWeaponTypeKey === 'all'
                    ? 'Weapon Type Distribution'
                    : 'Specific Weapon Type Distribution')
                  : 'Winrate Distribution'}
              </h3>
              {hasWeaponColumns ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%" labelLine={false}
                      label={({ name, value }) => `${name} (${value})`}
                      outerRadius={95} dataKey="value"
                    >
                      {pieData.map((entry, index) => {
                        const color = selectedWeaponTypeKey === 'all'
                          ? CATEGORY_COLORS[GENERAL_CATEGORIES[index % GENERAL_CATEGORIES.length]] || '#8884d8'
                          : '#82ca9d';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={winDist}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis />
                    <RTooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Type Counts</h3>
              {hasWeaponColumns && selectedWeaponTypeKey === 'all' ? (
                <div className="space-y-2">
                  {generalStats.map((g) => (
                    <div key={g.key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="legend-dot" style={{ backgroundColor: CATEGORY_COLORS[g.key] }}></span>
                        <span className="font-medium">{g.label}</span>
                      </div>
                      <span className="text-sm text-gray-600">{g.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {specificStats.map((s) => (
                    <div key={s.key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="font-medium">{s.label}</span>
                      <span className="text-sm text-gray-600">{s.count}</span>
                    </div>
                  ))}
                  {specificStats.length === 0 && <div className="text-sm text-gray-500">No specific weapon data under current filters.</div>}
                </div>
              )}
            </div>
          </div>

          {/* Top 10 lists below the pie section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Top 10 by Official Rank</h3>
              <div className="space-y-2">
                {topByOfficial.map((b, i) => {
                  const rc = parseRankChange(b.RankChangeRaw);
                  const eRank = effectivenessRankMap[b.Bot] || '—';
                  return (
                    <div key={b.Bot} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-right font-semibold">{i + 1}.</span>
                        <BotImage botName={b.Bot} className="w-6 h-6 rounded" />
                        <div>
                          <div className="text-sm font-medium">{b.Bot}</div>
                          <div className="text-xs text-gray-600">E-Rank #{eRank} • WR {((b.winrateNorm || 0) * 100).toFixed(0)}% • KO {((b.koWinrateNorm || 0) * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-700">#{b.Rank} <span className="ml-1"><RankChangeChip {...rc} /></span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Top 10 by E-Rank</h3>
              <div className="space-y-2">
                {topByERank.map((b) => {
                  const rc = parseRankChange(b.RankChangeRaw);
                  return (
                    <div key={b.Bot} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-right font-semibold">{b.eRank}.</span>
                        <BotImage botName={b.Bot} className="w-6 h-6 rounded" />
                        <div>
                          <div className="text-sm font-medium">{b.Bot}</div>
                          <div className="text-xs text-gray-600">Official #{b.Rank} • WR {((b.winrateNorm || 0) * 100).toFixed(0)}% • KO {((b.koWinrateNorm || 0) * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-700">E#{b.eRank} <span className="ml-1"><RankChangeChip {...rc} /></span></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Best by Specific Weapon Type</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Specific Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Best (Official Rank)</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Official Rank</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Best (E-Rank)</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">E-Rank</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bySpecific.map((row) => {
                    const eRank = row.bestERank ? effectivenessRankMap[row.bestERank.Bot] : null;
                    return (
                      <tr key={row.key} className="align-top">
                        <td className="px-4 py-2 text-sm font-medium">{row.label}</td>
                        <td className="px-4 py-2">
                          {row.bestOfficial ? (
                            <div className="flex items-center gap-2">
                              <BotImage botName={row.bestOfficial.Bot} className="w-8 h-8 rounded" />
                              <div>
                                <div className="text-sm font-medium">{row.bestOfficial.Bot}</div>
                                <div className="text-xs text-gray-600">
                                  {pct((row.bestOfficial.winrateNorm || 0) * 100)} WR • {pct((row.bestOfficial.koWinrateNorm || 0) * 100)} KO
                                </div>
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {row.bestOfficial ? (
                            <div className="flex items-center gap-1">
                              #{row.bestOfficial.Rank}
                              <RankChangeChip {...parseRankChange(row.bestOfficial.RankChangeRaw)} />
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2">
                          {row.bestERank ? (
                            <div className="flex items-center gap-2">
                              <BotImage botName={row.bestERank.Bot} className="w-8 h-8 rounded" />
                              <div>
                                <div className="text-sm font-medium">{row.bestERank.Bot}</div>
                                <div className="text-xs text-gray-600">
                                  {pct((row.bestERank.winrateNorm || 0) * 100)} WR • {pct((row.bestERank.koWinrateNorm || 0) * 100)} KO
                                </div>
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2 text-sm">#{eRank || '—'}</td>
                      </tr>
                    );
                  })}
                  {bySpecific.length === 0 && (
                    <tr><td className="px-4 py-4 text-sm text-gray-500" colSpan={5}>No specific weapon data under current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Winrate Distribution (5% bins)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={winDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="key" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;