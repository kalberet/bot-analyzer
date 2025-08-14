import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';
import {
  normalize,
  getGeneralCategory,
  computeKORate,
  computeKOAgainstRate,
  commonLabel,
} from '../utils/utils';

export default function useCSVData() {
  const [rawRows, setRawRows] = useState([]); // EXACT rows from CSV (unchanged)
  const [bots, setBots] = useState([]);       // derived fields for UI
  const [loading, setLoading] = useState(false);
  const [lastLoadInfo, setLastLoadInfo] = useState(null); // { fileName, botCount, withWeapons, hasPoints, at }

  const processRows = (rows, sourceName = 'data.csv') => {
    const onlyWithNames = rows.filter((r) => r && r.Bot);
    setRawRows(onlyWithNames);

    const derived = onlyWithNames.map((row, idx) => {
      // DO NOT modify original values; create normalized numbers for charts
      const fights = Number(row.Fights) || 0;
      const W = Number(row.W) || 0;
      const L = Number(row.L) || 0;

      // Winrate: accept 0–1 or 0–100 from CSV
      const winRaw = row.Winrate ?? row['%'] ?? row.Percent;
      let winrateNorm = 0;
      if (Number.isFinite(Number(winRaw))) {
        const v = Number(winRaw);
        winrateNorm = v > 1.0001 ? v / 100 : v;
      }

      // KO Winrate: accept 0–1 or 0–100; else derive from KOs/W
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
        // passthrough (original)
        raw: row,
        Bot: (row.Bot || '').toString().trim(),
        Rank: parseInt(row.Rank) || idx + 1,
        RankChangeRaw: row['Rank Change'] ?? row.RankChange ?? '—',
        Events: Number(row.Events) || 0,
        Fights: fights,
        W, L,
        Points: Number(row.Points),
        KOs: Number(row.KOs) || 0,
        KOd: Number(KOd) || null,

        // normalized fields (for charts/UI)
        Winrate: Number.isFinite(Number(winRaw)) ? Number(winRaw) : null,
        KOWinrate: Number.isFinite(Number(KOWinRaw)) ? Number(KOWinRaw) : null,
        winrateNorm,
        koWinrateNorm,
        KOAgainstRate: koAgainstRate || 0,

        WeaponType: weaponType || '',
        'WeaponType-specific': weaponSpec || '',
        wTypeNorm,
        wSpecNorm,
        category: (weaponType || weaponSpec)
          ? getGeneralCategory({ WeaponType: weaponType, 'WeaponType-specific': weaponSpec })
          : 'other',
      };
    });

    setBots(derived);

    const withWeapons = derived.filter((d) => d.WeaponType || d['WeaponType-specific']).length;
    const hasPoints = derived.some((d) => Number.isFinite(Number(d.Points)));
    setLastLoadInfo({
      fileName: sourceName,
      botCount: derived.length,
      withWeapons,
      hasPoints,
      at: new Date().toISOString(),
    });
  };

  const uploadCSV = (file) => {
    if (!file || file.type !== 'text/csv') return;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        processRows(results.data, file.name || 'data.csv');
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  };

  // Load the sample from /public/sample.csv directly into the app
  const loadSampleIntoApp = async () => {
    try {
      setLoading(true);
      const url = `${import.meta.env.BASE_URL}sample.csv`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Sample CSV not found at ${url}`);
      const text = await res.text();

      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          processRows(results.data, 'sample.csv');
          setLoading(false);
        },
        error: () => setLoading(false),
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert('Could not load sample.csv. Make sure it exists in /public.');
    }
  };

  // Download the sample CSV from /public/sample.csv
  const downloadSample = async () => {
    try {
      const url = `${import.meta.env.BASE_URL}sample.csv`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Sample not found');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sample.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
      alert('Sample CSV not found. Add sample.csv to /public.');
    }
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
    // Export the original rows for the filtered bots (no derived fields)
    const names = new Set(filteredBots.map((b) => b.Bot));
    const rows = rawRows.filter((r) => names.has(r.Bot));
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

  return {
    loading,
    rawRows,
    bots,
    uploadCSV,
    hasWeaponColumns,
    weaponTypeOptions,
    downloadFilteredAsCSV,
    downloadSample,
    loadSampleIntoApp,
    lastLoadInfo,
  };
}