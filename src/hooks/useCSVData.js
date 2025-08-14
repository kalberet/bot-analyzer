import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';
import {
  normalize, getGeneralCategory, computeKORate, computeKOAgainstRate,
  commonLabel
} from '../utils/utils';

export default function useCSVData() {
  const [rawRows, setRawRows] = useState([]); // EXACT rows from CSV (untouched)
  const [bots, setBots] = useState([]);       // derived fields added for UI
  const [loading, setLoading] = useState(false);

  const uploadCSV = (file) => {
    if (!file || file.type !== 'text/csv') return;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.filter((r) => r && r.Bot);
        setRawRows(rows);

        const derived = rows.map((row, idx) => {
          // DO NOT mutate or rescale raw fields; derive normalized numbers separately
          const fights = Number(row.Fights) || 0;
          const W = Number(row.W) || 0;
          const L = Number(row.L) || 0;

          // Accept Winrate either 0-1 or 0-100 in CSV; store raw as-is and normalized copy for charting
          const winRaw = row.Winrate ?? row['%'] ?? row.Percent;
          let winrateNorm = 0;
          if (Number.isFinite(Number(winRaw))) {
            const v = Number(winRaw);
            winrateNorm = v > 1.0001 ? v / 100 : v;
          }

          const KOWinRaw = row.KOWinrate;
          let koWinrateNorm = 0;
          if (Number.isFinite(Number(KOWinRaw))) {
            const v = Number(KOWinRaw);
            koWinrateNorm = v > 1.0001 ? v / 100 : v;
          } else {
            koWinrateNorm = computeKORate(row.KOs, row.W);
          }

          const KOd = row["KO'd"] ?? row.KOd ?? null;
          const koAgainstRate = computeKOAgainstRate(KOd, row.L);

          const weaponType = (row.WeaponType || '').toString().trim();
          const weaponSpec = (row['WeaponType-specific'] || '').toString().trim();
          const wTypeNorm = weaponType ? normalize(weaponType) : '';
          const wSpecNorm = weaponSpec ? normalize(weaponSpec) : '';

          return {
            // raw passthrough
            raw: row,
            // identity / original
            Bot: (row.Bot || '').toString().trim(),
            Rank: parseInt(row.Rank) || idx + 1,
            RankChangeRaw: row['Rank Change'] ?? row.RankChange ?? '—',
            Events: Number(row.Events) || 0,
            Fights: fights,
            W, L,
            Points: Number(row.Points),
            KOs: Number(row.KOs) || 0,
            KOd: Number(KOd) || null,

            // normalized derived (never replace raw)
            Winrate: Number.isFinite(Number(winRaw)) ? Number(winRaw) : null,
            KOWinrate: Number.isFinite(Number(KOWinRaw)) ? Number(KOWinRaw) : null,
            winrateNorm,
            koWinrateNorm,
            KOAgainstRate: koAgainstRate || 0,

            WeaponType: weaponType || '',
            'WeaponType-specific': weaponSpec || '',
            wTypeNorm, wSpecNorm,
            category: (weaponType || weaponSpec) ? getGeneralCategory({ WeaponType: weaponType, 'WeaponType-specific': weaponSpec }) : 'other',
          };
        });

        setBots(derived);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  };

  const hasWeaponColumns = useMemo(
    () => bots.some((d) => d.WeaponType || d['WeaponType-specific']),
    [bots]
  );

  const weaponTypeOptions = useMemo(() => {
    if (!hasWeaponColumns || !bots.length) return [];
    const grouped = _.groupBy(bots, (b) => b.wTypeNorm || '(none)');
    return Object.entries(grouped)
      .filter(([k]) => k && k !== '(none)')
      .map(([key, items]) => ({
        key,
        label: commonLabel(items, 'WeaponType', key),
        count: items.length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [bots, hasWeaponColumns]);

  const downloadFilteredAsCSV = (filteredBots) => {
    // Export EXACT matching original rows without derived changes
    const matching = new Set(filteredBots.map((b) => b.Bot));
    const rows = rawRows.filter((r) => matching.has(r.Bot));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nhrl_filtered.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSample = () => {
    const rows = [
      ['Rank','Rank Change','Bot','Events','Fights','W','L','%','Points','KOs',"KO'd",'WeaponType','WeaponType-specific'],
      [1,'▲3','Repeater',5,27,22,5,0.815,19.65,17,2,'Vertical','Drum'],
      [2,'-','Shell Shock',4,20,15,5,0.75,12.1,12,4,'Horizontal','Shell'],
      [3,'!','Clamp Champ',2,9,6,3,0.667,3.2,3,1,'Control','Clamp'],
      [4,'▼2','Hammer Time',3,12,7,5,0.583,5.1,5,6,'Overhead','Hammer'],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nhrl_active_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    loading,
    rawRows,
    bots,
    uploadCSV,
    hasWeaponColumns,
    weaponTypeOptions,
    downloadFilteredAsCSV,
    downloadSample,
  };
}