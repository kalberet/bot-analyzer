import React, { useMemo } from 'react';
import _ from 'lodash';
import {
  ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip as RTooltip, Legend
} from 'recharts';
import { CATEGORY_COLORS, GENERAL_CATEGORIES, confidenceFromFights } from '../utils/utils';
import ChartTooltip from '../components/ChartTooltip';

const ScatterBlock = ({ title, data, xKey, xName, xType, xDomain, xFmt, yKey, yName, yType, yDomain, yFmt, pinnedBot, setPinnedBot }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type={xType} dataKey={xKey} name={xName} domain={xDomain} tickFormatter={xFmt} />
        <YAxis type={yType} dataKey={yKey} name={yName} domain={yDomain} tickFormatter={yFmt} />
        <RTooltip
          cursor={{ strokeDasharray: '3 3' }}
          content={(props) => (
            <ChartTooltip
              {...props}
              onPin={(d) => setPinnedBot((prev) => prev && prev.name === d.name ? null : d)}
            />
          )}
        />
        <Scatter
          name="Bots"
          data={data}
          shape={(props) => {
            const { cx, cy, payload } = props;
            const conf = confidenceFromFights(payload.fights);
            const fill = CATEGORY_COLORS[payload.category] || '#8884d8';
            const isPinned = pinnedBot && pinnedBot.name === payload.name;
            return (
              <circle
                cx={cx} cy={cy}
                r={isPinned ? 5.5 : 4}
                fill={fill}
                opacity={0.35 + conf * 0.65}
                stroke={isPinned ? '#0f172a' : 'none'}
                strokeWidth={isPinned ? 1.5 : 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setPinnedBot((prev) => prev && prev.name === payload.name ? null : payload);
                }}
                style={{ cursor: 'pointer' }}
              />
            );
          }}
        />
        <Legend
          content={() => (
            <div className="flex justify-center gap-4 mt-4">
              {GENERAL_CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-1">
                  <span className="legend-dot" style={{ backgroundColor: CATEGORY_COLORS[cat] }}></span>
                  <span className="text-sm capitalize">{cat}</span>
                </div>
              ))}
            </div>
          )}
        />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
);

const Analysis = ({ filteredBots, hasWeaponColumns, effectivenessRankMap, pinnedBot, setPinnedBot }) => {
  const corrData = useMemo(() => filteredBots.map((b) => ({
    name: b.Bot,
    rank: b.Rank,
    eRank: effectivenessRankMap[b.Bot] || null,
    points: b.Points,
    fights: b.Fights,
    W: b.W, L: b.L,
    winrate: (b.winrateNorm || 0) * 100,
    koWinrate: (b.koWinrateNorm || 0) * 100,
    category: hasWeaponColumns ? b.category : 'other',
  })), [filteredBots, hasWeaponColumns, effectivenessRankMap]);

  const fmtPct = (v) => `${v}%`;

  return (
    <div className="space-y-8">
      {!filteredBots.length ? (
        <div className="bg-white p-8 rounded-lg shadow">No data under current filters.</div>
      ) : (
        <>
          <ScatterBlock
            title="Rank vs Winrate"
            data={corrData}
            xKey="rank" xName="Rank" xType="number" xDomain={['dataMin', 'dataMax']} xFmt={(v) => v}
            yKey="winrate" yName="Winrate" yType="number" yDomain={[0, 100]} yFmt={fmtPct}
            pinnedBot={pinnedBot} setPinnedBot={setPinnedBot}
          />
          <ScatterBlock
            title="Winrate vs KO Winrate"
            data={corrData}
            xKey="winrate" xName="Winrate" xType="number" xDomain={[0, 100]} xFmt={fmtPct}
            yKey="koWinrate" yName="KO Winrate" yType="number" yDomain={[0, 100]} yFmt={fmtPct}
            pinnedBot={pinnedBot} setPinnedBot={setPinnedBot}
          />
          <ScatterBlock
            title="Winrate vs Fights"
            data={corrData}
            xKey="fights" xName="Fights" xType="number" xDomain={['auto', 'auto']} xFmt={(v) => v}
            yKey="winrate" yName="Winrate" yType="number" yDomain={[0, 100]} yFmt={fmtPct}
            pinnedBot={pinnedBot} setPinnedBot={setPinnedBot}
          />
          <ScatterBlock
            title="Points vs Winrate"
            data={corrData.filter((d) => Number.isFinite(d.points))}
            xKey="winrate" xName="Winrate" xType="number" xDomain={[0, 100]} xFmt={fmtPct}
            yKey="points" yName="Points" yType="number" yDomain={['auto', 'auto']} yFmt={(v) => v}
            pinnedBot={pinnedBot} setPinnedBot={setPinnedBot}
          />
          <ScatterBlock
            title="KO Winrate vs Fights"
            data={corrData}
            xKey="fights" xName="Fights" xType="number" xDomain={['auto', 'auto']} xFmt={(v) => v}
            yKey="koWinrate" yName="KO Winrate" yType="number" yDomain={[0, 100]} yFmt={fmtPct}
            pinnedBot={pinnedBot} setPinnedBot={setPinnedBot}
          />
        </>
      )}
    </div>
  );
};

export default Analysis;