import React from 'react';
import {
  Info, AlertTriangle, CheckCircle2, Wrench, Cloud, GitBranch, FileWarning, Settings, ShieldCheck, BookOpen
} from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-gray-700" />} {title}
    </h3>
    <div className="text-gray-700">{children}</div>
  </div>
);

const Code = ({ children }) => (
  <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded overflow-x-auto">
    <code>{children}</code>
  </pre>
);

const Docs = () => {
  return (
    <div className="space-y-8">
      <Section icon={BookOpen} title="About this tool">
        <p className="leading-relaxed">
          This analyzer helps you explore NHRL beetleweight performance using a CSV you provide. We preserve your CSV
          exactly as-is and compute normalized fields only for visualization. E‑Rank is an analytical metric that blends
          consistency (winrate) with stopping power (KO winrate) and has special handling for control bots.
        </p>
      </Section>

      <Section icon={Info} title="Data handling and metric details">
        <ul className="list-disc list-inside space-y-2">
          <li>
            CSV fidelity: original rows are stored verbatim and used for CSV export. Derived fields (e.g., winrateNorm)
            are only used in charts.
          </li>
          <li>
            Winrate/KOWinrate normalization: accepts 0–1 or 0–100. We normalize to 0–1 internally but never overwrite your raw values.
          </li>
          <li>
            KO rate fallback: if KOWinrate is missing, we compute KO wins per win from KOs and W.
          </li>
          <li>
            KO’d rate: when KO’d is present (supports “KO'd” or “KOd”), we compute KOAgainstRate = KO’d / losses.
          </li>
          <li>
            Weapon typing: if WeaponType or WeaponType-specific is missing, weapon-specific charts hide automatically.
          </li>
          <li>
            Rank Change parsing: supports your CSV’s symbols and legacy variants.
            <ul className="ml-5 list-disc">
              <li>Current: “▲N” up, “▼N” down, “-” no change, “!” first event</li>
              <li>Also supported: ▲N/▼N, +N/−N, and “up N”/“down N”</li>
            </ul>
          </li>
          <li>
            E‑Rank weighting: default 70% Winrate + 30% KO. Control (non‑flamethrower) bots can ignore KO% with the header toggle.
            A small “CA” badge marks control‑adjusted E‑Rank entries when the toggle is OFF.
          </li>
          <li>
            Ranking context in Insights: used to estimate rookie penalty and bonus signal.
            <ul className="ml-5 list-disc">
              <li>3lb all‑time: min fights = 10</li>
              <li>3lb season+previous: min fights = 8 (default)</li>
              <li>Other classes: min fights = 5</li>
            </ul>
          </li>
          <li>
            Points usage: if Points exists, Insights enables Points per Fight and “bonus‑heavy” estimates. We do not recompute official points.
          </li>
        </ul>
      </Section>

      <Section icon={Wrench} title="Contingencies and fallbacks implemented">
        <ul className="list-disc list-inside space-y-2">
          <li>
            Missing KOWinrate → compute from KOs/W. Missing KO’d → hide KOAgainstRate visuals that depend on it.
          </li>
          <li>
            Missing weapon columns → hide weapon charts/filters; Overview switches to generic distributions.
          </li>
          <li>
            Missing Points → hide Points-based insights (lists and charts).
          </li>
          <li>
            Rank Change not present or empty → Movers/Rookies lists show a coverage banner and gracefully display “no entries”.
          </li>
          <li>
            Images not found (BrettZone) → show a neutral “No img” placeholder; image modal hides the broken image element.
          </li>
          <li>
            CSV winrate as 0–100 → auto-normalized to 0–1; charts remain accurate without changing your CSV.
          </li>
          <li>
            Percentages and formats vary → we support either “%” or “Winrate” columns, and KO’d as “KO'd” or “KOd”.
          </li>
          <li>
            SPA routing on GitHub Pages → we copy index.html to 404.html during deploy so deep links don’t 404.
          </li>
          <li>
            Sample data → served from /public/sample.csv; “Load sample into app” parses it directly for a guided demo.
          </li>
        </ul>
      </Section>

      <Section icon={Settings} title="Configuration knobs you can change">
        <ul className="list-disc list-inside space-y-2">
          <li>
            Control KO% toggle (header): include or ignore KO% for E‑Rank calculation on control (non‑flamethrower) bots.
          </li>
          <li>
            E‑Rank weights: can be adjusted in effectivenessScore. Current default is 70/30; control‑adjusted is 100/0 when KO% is ignored.
          </li>
          <li>
            Ranking context (Insights): choose 3lb all‑time (10), season+prev (8), or other classes (5) to size rookie penalty.
          </li>
          <li>
            Global filters (header): weapon type and minimum fights affect all tabs.
          </li>
          <li>
            Gallery density: Comfortable/Cozy/Compact.
          </li>
        </ul>
        <Code>{`// In utils/effectivenessScore:
export const effectivenessScore = (b, { includeControlKO = false, wrWeight = 0.7, koWeight = 0.3 } = {}) => {
  const wr = Number(b.winrateNorm || 0);
  const ko = Number(b.koWinrateNorm || 0);
  const controlNoFlame = b.category === 'control' && !isFlamethrower(b);
  const wWR = (controlNoFlame && !includeControlKO) ? 1 : wrWeight;
  const wKO = (controlNoFlame && !includeControlKO) ? 0 : koWeight;
  return wr * wWR + ko * wKO;
};`}</Code>
      </Section>

      <Section icon={AlertTriangle} title="Troubleshooting and solutions">
        <div className="space-y-3">
          <div>
            <p className="font-semibold">CSV loads but charts look odd</p>
            <ul className="list-disc list-inside text-sm">
              <li>Ensure Winrate is either a fraction (0–1) or percentage (0–100). We auto‑normalize both.</li>
              <li>If nothing appears in Movers: confirm “Rank Change” exists and uses ▲, ▼, -, or !.</li>
              <li>No Points-based insights? Add a Points column to your CSV.</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Images don’t load</p>
            <ul className="list-disc list-inside text-sm">
              <li>We query BrettZone by bot name. If no image exists there, you’ll see “No img”.</li>
              <li>Clicking a card still opens the modal with stats and placeholders.</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">GitHub Pages deploy issues</p>
            <ul className="list-disc list-inside text-sm">
              <li>Blank page on GitHub Pages → set base in vite.config.js to <code>'/bot-analyzer/'</code>.</li>
              <li>404 on refresh → ensure deploy copies <code>dist/index.html</code> to <code>dist/404.html</code>.</li>
              <li>gh-pages not finding a folder → deploy the folder Vite builds (<code>dist</code> by default).</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">CI install error EBADPLATFORM (Rollup/Esbuild binaries)</p>
            <ul className="list-disc list-inside text-sm">
              <li>Fix used: removed mac‑generated <code>package-lock.json</code> in CI and installed with <code>--omit=optional</code>, or patched lockfile to drop darwin binaries.</li>
              <li>Long‑term: regenerate <code>package-lock.json</code> on Linux (WSL/Docker/Codespaces) for stable CI with <code>npm ci</code>.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section icon={Cloud} title="Deploy details (GitHub Pages)">
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Vite base: <code>base: '/bot-analyzer/'</code> in vite.config.js</li>
          <li>SPA fallback: copy <code>index.html</code> → <code>404.html</code> during deploy</li>
          <li>Branch: gh-pages (Settings → Pages → Deploy from a branch)</li>
        </ul>
        <Code>{`// package.json (scripts)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build && shx cp -f dist/index.html dist/404.html",
    "deploy": "gh-pages -d dist -b gh-pages"
  }
}`}</Code>
      </Section>

      <Section icon={ShieldCheck} title="Data privacy and non‑affiliation">
        <ul className="list-disc list-inside space-y-2">
          <li>Data stays in your browser except when you explicitly download filtered CSV.</li>
          <li>Images are fetched by name from BrettZone; no credentials are used.</li>
          <li>This tool is independent and not officially affiliated with NHRL.</li>
        </ul>
      </Section>

      <Section icon={GitBranch} title="Changelog and roadmap">
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-semibold">Recent</p>
            <ul className="list-disc list-inside">
              <li>Control‑adjusted E‑Rank with global toggle + “CA” badge</li>
              <li>Overview: Top 10 by Rank and Top 10 by E‑Rank</li>
              <li>Insights: Movers, Rookies, Points per Fight, Bonus‑heavy, Control specialists, KO artists, Glass cannons, Tanks, Penalty watchlist</li>
              <li>Rank Change parser: now supports ▲, ▼, -, !, ▲/▼, +/−, “up N”, “down N”</li>
              <li>Home: clear “CSV loaded” card, sample.csv loader/downloader</li>
              <li>Deploy/CI fixes for platform‑specific binaries</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Planned ideas</p>
            <ul className="list-disc list-inside">
              <li>Chart export (PNG) and sharable links with filters encoded</li>
              <li>Custom E‑Rank weight presets (60/40, 50/50)</li>
              <li>Per‑event drilling if fight‑by‑fight data is provided</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section icon={FileWarning} title="FAQ">
        <ul className="list-disc list-inside space-y-2">
          <li>
            Where is the sample CSV? → <code>/public/sample.csv</code>. Replace it with your own; the Home page buttons use that path.
          </li>
          <li>
            Why isn’t my “Biggest Movers” list populated? → Check the “Rank Change” column: use “▲N”, “▼N”, “-”, or “!”.
          </li>
          <li>
            Why don’t weapon charts show up? → Add columns WeaponType and/or WeaponType-specific.
          </li>
          <li>
            Why are points insights missing? → Ensure a numeric Points column is in the CSV.
          </li>
        </ul>
      </Section>
    </div>
  );
};

export default Docs;