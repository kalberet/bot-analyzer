import React from 'react';
import BotImage from './BotImage';
import { pct } from '../utils/utils';
import { Pin } from 'lucide-react';

const ChartTooltip = ({ active, payload, onPin }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const W = d.W ?? d.w ?? d.wins ?? '—';
  const L = d.L ?? d.l ?? d.losses ?? '—';

  return (
    <div className="bg-white p-3 border rounded shadow-lg w-56">
      <div className="flex flex-col items-center mb-2">
        <BotImage botName={d.name} className="w-12 h-12 rounded" />
        <p className="font-semibold mt-1 text-center">{d.name}</p>
      </div>
      <div className="text-sm space-y-0.5">
        <div>Rank: #{d.rank} {d.eRank ? `• E-Rank #${d.eRank}` : ''}</div>
        {d.points != null && <div>Points: {d.points}</div>}
        <div>Fight record: {W}-{L}</div>
        <div>Winrate: {pct(d.winrate)}</div>
        <div>KO winrate: {pct(d.koWinrate)}</div>
      </div>
      <button className="btn-pin mt-2 w-full" onClick={() => onPin(d)} title="Pin to compare">
        <Pin className="w-3 h-3" /> Pin
      </button>
    </div>
  );
};

export default ChartTooltip;