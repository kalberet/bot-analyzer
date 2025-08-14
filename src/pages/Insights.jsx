import React, { useMemo, useState } from 'react';
import _ from 'lodash';
import BotImage from '../components/BotImage';
import RankChangeChip from '../components/RankChangeChip';
import {
  effectivenessScore,
  impliedPointMods,
  estimateBonusFromUpsetsAndFinals,
  rookieDeficit,
  isFlamethrower,
} from '../utils/utils';

const List = ({ title, rows, renderRight }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    {rows.length === 0 ? (
      <div className="text-sm text-gray-500">No entries under current filters.</div>
    ) : (
      <ul className="space-y-2">
        {rows.map((b, idx) => (
          <li key={`${title}-${b.Bot}-${idx}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <span className="w-6 text-right font-semibold">{idx + 1}.</span>
              <BotImage botName={b.Bot} className="w-6 h-6 rounded" />
              <div>
                <div className="text-sm font-medium">{b.Bot}</div>
                <div className="text-xs text-gray-600">
                  {b.W}-{b.L} • WR {((b.winrateNorm || 0) * 100).toFixed(0)}% • KO {((b.koWinrateNorm || 0) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-700">{renderRight ? renderRight(b) : null}</div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Insights = ({ filteredBots, effectivenessRankMap, parseRankChange, includeControlKO }) => {
  // Default to 3lb single-year (current season + previous season)
  const [ctx, setCtx] = useState('3lb-year'); // '3lb-all' | '3lb-year' | 'other'
  const [minF, setMinF] = useState(8);
  const minFightThreshold = ctx === '3lb-all' ? 10 : (ctx === '3lb-year' ? 8 : 5);

  const withDerived = useMemo(() => {
    return filteredBots.map((b) => {
      const eRank = effectivenessRankMap[b.Bot] || null;
      const delta = eRank ? (b.Rank - eRank) : 0;
      const rc = parseRankChange(b.RankChangeRaw);
      const eScore = effectivenessScore(b, { includeControlKO });
      const mods = impliedPointMods(b); // Points - (W-L), may be null if no Points
      const bonusOnly = estimateBonusFromUpsetsAndFinals(b, minFightThreshold); // approx finals/upset
      const rookiePtsDeficit = rookieDeficit(b, minFightThreshold);
      const pointsPerFight = (Number.isFinite(Number(b.Points)) && b.Fights > 0) ? (b.Points / b.Fights) : null;
      const KOd = Number(b.KOd) || 0;
      const koDiff = (Number(b.KOs) || 0) - KOd;
      const koDiffPerFight = b.Fights > 0 ? koDiff / b.Fights : null;

      return {
        ...b,
        eRank, delta, rc, eScore,
        mods, bonusOnly, rookiePtsDeficit,
        pointsPerFight, koDiffPerFight,
      };
    });
  }, [filteredBots, effectivenessRankMap, parseRankChange, includeControlKO, minFightThreshold]);

  // Coverage banner for quick sanity check of Rank Change presence
  const rcCoverage = useMemo(() => {
    const counts = _.countBy(withDerived, (b) => b.rc?.dir || 'unknown');
    return {
      up: counts.up || 0,
      down: counts.down || 0,
      new: counts.new || 0,
      same: counts.same || 0,
      unknown: counts.unknown || 0,
    };
  }, [withDerived]);

  // Classic E-Rank vs Official
  const overperformers = useMemo(
    () => withDerived.filter((b) => b.eRank && b.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 10),
    [withDerived]
  );
  const underperformers = useMemo(
    () => withDerived.filter((b) => b.eRank && b.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 10),
    [withDerived]
  );

  // Movers from Rank Change
  const moversUp = useMemo(
    () => withDerived.filter((b) => b.rc.dir === 'up' && b.rc.value > 0).sort((a, b) => b.rc.value - a.rc.value).slice(0, 10),
    [withDerived]
  );
  const moversDown = useMemo(
    () => withDerived.filter((b) => b.rc.dir === 'down' && b.rc.value > 0).sort((a, b) => b.rc.value - a.rc.value).slice(0, 10),
    [withDerived]
  );
  const rookies = useMemo(
    () => withDerived.filter((b) => b.rc.dir === 'new').sort((a, b) => b.eScore - a.eScore).slice(0, 10),
    [withDerived]
  );
  const stable = useMemo(
    () => withDerived.filter((b) => b.rc.dir === 'same').sort((a, b) => a.Rank - b.Rank).slice(0, 10),
    [withDerived]
  );

  // Points-based insights (if Points present)
  const havePoints = useMemo(() => withDerived.some((b) => Number.isFinite(Number(b.Points))), [withDerived]);

  const pointsPerFightLeaders = useMemo(
    () => havePoints
      ? withDerived.filter((b) => b.pointsPerFight != null && b.Fights >= minF)
          .sort((a, b) => b.pointsPerFight - a.pointsPerFight).slice(0, 10)
      : [],
    [withDerived, minF, havePoints]
  );

  const bonusHeavy = useMemo(
    () => havePoints
      ? withDerived.filter((b) => b.bonusOnly != null && b.Fights >= minF)
          .sort((a, b) => (b.bonusOnly) - (a.bonusOnly)).slice(0, 10)
      : [],
    [withDerived, minF, havePoints]
  );

  const penaltyWatchlist = useMemo(
    () => withDerived
      .filter((b) => b.Fights < minFightThreshold)
      .sort((a, b) => b.eScore - a.eScore)
      .slice(0, 10),
    [withDerived, minFightThreshold]
  );

  // Style/durability
  const koArtists = useMemo(
    () => withDerived
      .filter((b) => b.Fights >= minF)
      .sort((a, b) => (b.koWinrateNorm || 0) - (a.koWinrateNorm || 0))
      .slice(0, 10),
    [withDerived, minF]
  );

  const glassCannons = useMemo(
    () => withDerived
      .filter((b) => b.Fights >= minF)
      .map((b) => ({ ...b, glassScore: (b.koWinrateNorm || 0) * 0.7 + (b.KOAgainstRate || 0) * 0.3 }))
      .sort((a, b) => b.glassScore - a.glassScore)
      .slice(0, 10),
    [withDerived, minF]
  );

  const tanks = useMemo(
    () => withDerived
      .filter((b) => b.Fights >= minF)
      .map((b) => ({ ...b, tankScore: (1 - (b.KOAgainstRate || 0)) * 0.7 + (b.winrateNorm || 0) * 0.3 }))
      .sort((a, b) => b.tankScore - a.tankScore)
      .slice(0, 10),
    [withDerived, minF]
  );

  const controlSpecialists = useMemo(
    () => withDerived
      .filter((b) => b.category === 'control' && !isFlamethrower(b) && b.Fights >= minF)
      .sort((a, b) => b.eScore - a.eScore)
      .slice(0, 10),
    [withDerived, minF]
  );

  const controlUndervalued = useMemo(
    () => withDerived
      .filter((b) => b.category === 'control' && !isFlamethrower(b) && b.eRank && (b.Rank - b.eRank) > 0)
      .sort((a, b) => (b.Rank - b.eRank) - (a.Rank - a.eRank))
      .slice(0, 10),
    [withDerived]
  );

  return (
    <div className="space-y-8">
      {!filteredBots.length ? (
        <div className="bg-white p-8 rounded-lg shadow">No data under current filters.</div>
      ) : (
        <>
          {/* Controls */}
          <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Ranking context:</span>
              <label className="text-sm flex items-center gap-1">
                <input
                  type="radio"
                  name="ctx"
                  value="3lb-all"
                  checked={ctx === '3lb-all'}
                  onChange={() => { setCtx('3lb-all'); setMinF(10); }}
                />
                3lb All-time (min 10)
              </label>
              <label className="text-sm flex items-center gap-1">
                <input
                  type="radio"
                  name="ctx"
                  value="3lb-year"
                  checked={ctx === '3lb-year'}
                  onChange={() => { setCtx('3lb-year'); setMinF(8); }}
                />
                3lb Season+Prev (min 8)
              </label>
              <label className="text-sm flex items-center gap-1">
                <input
                  type="radio"
                  name="ctx"
                  value="other"
                  checked={ctx === 'other'}
                  onChange={() => { setCtx('other'); setMinF(5); }}
                />
                Other classes (min 5)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Min fights for lists</label>
              <input
                type="number"
                min={0}
                step={1}
                value={minF}
                onChange={(e) => setMinF(Math.max(0, Number(e.target.value)))}
                className="w-20 border rounded-md px-2 py-1 text-sm"
                title="Minimum fights gate for some leaderboards"
              />
            </div>
          </div>

          {/* Rank-change coverage (helps explain empty movers) */}
          <div className="bg-white p-3 rounded-lg shadow text-sm text-gray-700">
            Rank change coverage (under current filters): ▲{rcCoverage.up} • ▼{rcCoverage.down} • ! {rcCoverage.new} • — {rcCoverage.same}{rcCoverage.unknown ? ` • ? ${rcCoverage.unknown}` : ''}
            {rcCoverage.up + rcCoverage.down + rcCoverage.new === 0 && (
              <span className="ml-2 text-gray-500">No movers detected — ensure your CSV has a “Rank Change” column populated for this event window.</span>
            )}
          </div>

          {/* E-Rank vs Official */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <List
              title="Overperformers (E-Rank better than Official)"
              rows={overperformers}
              renderRight={(b) => <>Official #{b.Rank} → E#{b.eRank} • Δ+{b.delta}</>}
            />
            <List
              title="Underperformers (E-Rank worse than Official)"
              rows={underperformers}
              renderRight={(b) => <>Official #{b.Rank} → E#{b.eRank} • Δ{b.delta}</>}
            />
          </div>

          {/* Movers and Rookies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <List
              title="Biggest Movers Up"
              rows={moversUp}
              renderRight={(b) => <>#{b.Rank} <span className="ml-1"><RankChangeChip {...b.rc} /></span></>}
            />
            <List
              title="Biggest Movers Down"
              rows={moversDown}
              renderRight={(b) => <>#{b.Rank} <span className="ml-1"><RankChangeChip {...b.rc} /></span></>}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <List
              title="Rookies to Watch"
              rows={rookies}
              renderRight={(b) => <>#{b.Rank} • E#{b.eRank || '—'}</>}
            />
            <List
              title="Solid Performers (Stable Rank)"
              rows={stable}
              renderRight={(b) => <>#{b.Rank} <span className="ml-1"><RankChangeChip {...b.rc} /></span></>}
            />
          </div>

          {/* Points-based insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <List
              title="Points per Fight Leaders"
              rows={pointsPerFightLeaders}
              renderRight={(b) => <>Pts/F: {b.pointsPerFight?.toFixed(2)}{b.Points != null ? <> • Pts {b.Points}</> : null}</>}
            />
            <List
              title="Bonus-heavy Winners (est. finals/upset bonus)"
              rows={bonusHeavy}
              renderRight={(b) => <>Est bonus: {b.bonusOnly?.toFixed(2)}{b.mods != null ? <> • Mods {b.mods.toFixed(2)}</> : null}{b.rookiePtsDeficit > 0 ? <> • Rookie −{b.rookiePtsDeficit}</> : null}</>}
            />
          </div>

          {/* Style/durability */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <List
              title="KO Artists (highest KO winrate)"
              rows={koArtists}
              renderRight={(b) => <>KO: {((b.koWinrateNorm || 0) * 100).toFixed(1)}%</>}
            />
            <List
              title="Glass Cannons (hit hard, fragile)"
              rows={glassCannons}
              renderRight={(b) => <>KO {((b.koWinrateNorm || 0) * 100).toFixed(1)}% • KO’d/L {(b.KOAgainstRate * 100).toFixed(1)}%</>}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <List
              title="Tanks (durable winners)"
              rows={tanks}
              renderRight={(b) => <>KO’d/L {(b.KOAgainstRate * 100).toFixed(1)}% • WR {((b.winrateNorm || 0) * 100).toFixed(1)}%</>}
            />
            <List
              title="Penalty Watchlist (under min fights, high E-Score)"
              rows={penaltyWatchlist}
              renderRight={(b) => <>Fights {b.Fights} • E-Score {(b.eScore * 100).toFixed(1)}</>}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <List
              title="Control Specialists (control-adjusted E-Rank)"
              rows={controlSpecialists}
              renderRight={(b) => <>E-Score {(b.eScore * 100).toFixed(1)} • WR {((b.winrateNorm || 0) * 100).toFixed(1)}%</>}
            />
            <List
              title="Control, Undervalued by Official Rank"
              rows={controlUndervalued}
              renderRight={(b) => <>Official #{b.Rank} → E#{b.eRank} • Δ+{b.delta}</>}
            />
          </div>

          {havePoints && (
            <div className="bg-white p-3 rounded border text-xs text-gray-600">
              Notes: Mods = Points − (W − L). Est bonus ≈ Mods + max(0, min_fights − fights) to back out rookie penalty. This approximates finals/upset bonus; exact values require fight-by-fight data.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Insights;