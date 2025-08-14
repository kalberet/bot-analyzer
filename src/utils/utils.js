import _ from 'lodash';

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const pct = (v, d = 1) => `${(Number(v) || 0).toFixed(d)}%`;
export const capFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
export const titleCase = (s) =>
  (s || '')
    .toLowerCase()
    .split(/[\s\-]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ')
    .trim();

export const normalize = (s) =>
  (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

export const getBotImageUrl = (botName) => {
  if (!botName) return null;
  const formatted = botName.toLowerCase();
  return `https://brettzone.nhrl.io/brettZone/getBotPic.php?bot=${encodeURIComponent(formatted)}`;
};

export const GENERAL_CATEGORIES = ['horizontal', 'vertical', 'overhead', 'control', 'other'];
export const CATEGORY_COLORS = {
  horizontal: '#ff7c7c',
  vertical: '#8884d8',
  overhead: '#82ca9d',
  control: '#ffc658',
  other: '#8dd1e1',
};

export const getGeneralCategory = (bot) => {
  const text = `${bot?.WeaponType || ''} ${bot?.['WeaponType-specific'] || ''}`.toLowerCase();
  if (!text.trim()) return 'other';
  if (/(hammer|axe|overhead)/.test(text)) return 'overhead';
  if (/(lifter|clamp|grab|grabber|control|flipper|wedge|pincer|fork)/.test(text)) return 'control';
  if (/(horizontal|undercutter|shell|full body|ring|bar)/.test(text)) return 'horizontal';
  if (/(vertical|drum|eggbeater|beater|bar)/.test(text)) return 'vertical';
  return 'other';
};

export const parseRankChange = (raw) => {
  const rawStr = (raw ?? '').toString().trim();
  if (!rawStr) return { dir: 'same', value: 0, label: '—' };

  const s = rawStr.replace(/\s+/g, '').toLowerCase();

  // No change
  if (s === '-' || s === '—' || s === '–') {
    return { dir: 'same', value: 0, label: '—' };
  }

  // Rookie/new
  if (s.includes('!') || s === '!' || /\bnew\b|\brookie\b/.test(rawStr.toLowerCase())) {
    return { dir: 'new', value: null, label: '!' };
  }

  // Your new symbols: > up, < down (with optional number)
  let m;
  if ((m = s.match(/^>(\d+)?$/))) {
    const v = Number(m[1] || 1);
    return { dir: 'up', value: v, label: `▲${v}` };
  }
  if ((m = s.match(/^<(\d+)?$/))) {
    const v = Number(m[1] || 1);
    return { dir: 'down', value: v, label: `▼${v}` };
  }

  // Also allow spaced versions: "> 3", "< 2"
  if ((m = rawStr.match(/^\>\s*(\d+)?$/))) {
    const v = Number(m[1] || 1);
    return { dir: 'up', value: v, label: `▲${v}` };
  }
  if ((m = rawStr.match(/^\<\s*(\d+)?$/))) {
    const v = Number(m[1] || 1);
    return { dir: 'down', value: v, label: `▼${v}` };
  }

  // Backward compatible: triangles, signed numbers, words
  if ((m = s.match(/^▲(\d+)?$/))) {
    const v = Number(m[1] || 1);
    return { dir: 'up', value: v, label: `▲${v}` };
  }
  if ((m = s.match(/^▼(\d+)?$/))) {
    const v = Number(m[1] || 1);
    return { dir: 'down', value: v, label: `▼${v}` };
  }
  if ((m = s.match(/^([+\-−])(\d+)$/))) {
    const sign = m[1];
    const v = Number(m[2]);
    return sign === '+' ? { dir: 'up', value: v, label: `▲${v}` } : { dir: 'down', value: v, label: `▼${v}` };
  }
  if (/^up(\d+)?$/.test(s)) {
    const v = Number((s.match(/\d+/) || [1])[0] || 1);
    return { dir: 'up', value: v, label: `▲${v}` };
  }
  if (/^down(\d+)?$/.test(s)) {
    const v = Number((s.match(/\d+/) || [1])[0] || 1);
    return { dir: 'down', value: v, label: `▼${v}` };
  }

  // Plain numeric fallback
  const n = Number(s);
  if (Number.isFinite(n)) {
    if (n > 0) return { dir: 'up', value: n, label: `▲${n}` };
    if (n < 0) return { dir: 'down', value: Math.abs(n), label: `▼${Math.abs(n)}` };
    return { dir: 'same', value: 0, label: '—' };
  }

  return { dir: 'same', value: 0, label: '—' };
};

export const computeKORate = (KOs, W) => {
  const wins = Number(W) || 0;
  const kos = Number(KOs) || 0;
  if (wins <= 0) return 0;
  return clamp(kos / wins, 0, 1);
};
export const computeKOAgainstRate = (KOd, L) => {
  const losses = Number(L) || 0;
  const kod = Number(KOd) || 0;
  if (losses <= 0) return 0;
  return clamp(kod / losses, 0, 1);
};
export const confidenceFromFights = (fights, min = 5, ideal = 15) => {
  const f = Number(fights) || 0;
  if (f <= 0) return 0.1;
  return clamp((f - min) / Math.max(1, ideal - min), 0.2, 1);
};
export const commonLabel = (items, originalField, normalizedValue) => {
  const counts = _.countBy(items, (x) => (x[originalField] || '').toString().trim());
  const [label] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [null, 0];
  return label || titleCase(normalizedValue || '');
};

// 5% winrate bins
export const winrateBuckets5 = (bots) => {
  const buckets = Array.from({ length: 20 }, (_, i) => {
    const min = i * 0.05;
    const max = (i + 1) * 0.05;
    return { key: `${(min * 100).toFixed(0)}-${(max * 100).toFixed(0)}%`, min, max, count: 0 };
  });
  bots.forEach((b) => {
    const wr = Number(b.winrateNorm || b.Winrate);
    let idx = Math.floor(wr / 0.05);
    if (idx < 0) idx = 0;
    if (idx >= buckets.length) idx = buckets.length - 1;
    buckets[idx].count++;
  });
  return buckets.filter((b) => b.count > 0);
};

// E-Rank helpers: control (non-flamethrower) ignores KO component
// Control (non-flamethrower) => ignore KO component for E-Score
export const isFlamethrower = (b) => {
  const specNorm = (b.wSpecNorm || normalize(b['WeaponType-specific'] || ''));
  // Cover common variants
  return /(flame|flamethrow|flame thrower|torch)/.test(specNorm);
};
// E-Rank: control (non-flamethrower) ignores KO when includeControlKO=false
export const effectivenessScore = (b, opts = {}) => {
  const includeControlKO = opts.includeControlKO ?? false;
  const wrWeight = opts.wrWeight ?? 0.7;
  const koWeight = opts.koWeight ?? 0.3;

  const wr = Number(b.winrateNorm || 0);
  const ko = Number(b.koWinrateNorm || 0);
  const controlNoFlame = b.category === 'control' && !isFlamethrower(b);

  const wWR = (controlNoFlame && !includeControlKO) ? 1 : wrWeight;
  const wKO = (controlNoFlame && !includeControlKO) ? 0 : koWeight;

  return wr * wWR + ko * wKO;
};
// Points math helpers (CSV must include Points to use these)
export const basePoints = (b) => (Number(b.W) || 0) - (Number(b.L) || 0);
export const impliedPointMods = (b) => {
  const pts = Number(b.Points);
  if (!Number.isFinite(pts)) return null;
  return pts - basePoints(b);
};
// Rookie penalty magnitude in points if under threshold (always >= 0)
export const rookieDeficit = (b, minFightThreshold) =>
  Math.max(0, (Number(minFightThreshold) || 0) - (Number(b.Fights) || 0));

// Rough estimate of non-rookie bonus (finals + upsets) in points
export const estimateBonusFromUpsetsAndFinals = (b, minFightThreshold) => {
  const mods = impliedPointMods(b);
  if (mods == null) return null;
  const rd = rookieDeficit(b, minFightThreshold);
  return mods + rd;
};