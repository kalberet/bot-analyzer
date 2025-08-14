import React, { useEffect } from 'react';
import { pct, confidenceFromFights, getBotImageUrl } from '../utils/utils';
import RankChangeChip from './RankChangeChip';

const BotModal = ({ bot, onClose, eRank, parseRankChange }) => {
  if (!bot) return null;

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const rc = parseRankChange(bot.RankChangeRaw);
  const winratePct = (bot.winrateNorm ?? 0) * 100;
  const koPct = (bot.koWinrateNorm ?? 0) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-lg overflow-hidden max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-10" aria-label="Close">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-center mb-4">
            <img
              src={getBotImageUrl(bot.Bot)}
              alt={bot.Bot}
              className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1">{bot.Bot}</h2>
            <p className="text-gray-600 mb-4">{bot.WeaponType ? `${bot.WeaponType} — ${bot['WeaponType-specific'] || '—'}` : 'Weapon info: N/A'}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-4">
              <div className="metric-card blue">
                <p className="metric-label">Official Rank</p>
                <p className="metric-value">#{bot.Rank} <span className="ml-1"><RankChangeChip {...rc} /></span></p>
              </div>
              <div className="metric-card purple">
                <p className="metric-label">E-Rank</p>
                <p className="metric-value">#{eRank || '—'}</p>
              </div>
              <div className="metric-card green">
                <p className="metric-label">Win Rate</p>
                <p className="metric-value">{pct(winratePct)}</p>
              </div>
              <div className="metric-card red">
                <p className="metric-label">KO Rate</p>
                <p className="metric-value">{pct(koPct)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              Record: {bot.W}-{bot.L} ({bot.Fights} fights) • Events: {bot.Events}{' '}
              • KOs: {bot.KOs} • KO’d: {bot.KOd != null ? bot.KOd : 'N/A'}
              {bot.Points != null && <span> • Points: {bot.Points}</span>}
              <div className="confidence mt-2">
                <div className="confidence-fill" style={{ width: `${confidenceFromFights(bot.Fights) * 100}%` }}></div>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Confidence (fights-based)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotModal;