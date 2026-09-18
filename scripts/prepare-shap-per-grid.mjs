// Additive, out-of-STEP54-contract data, mirrors the map context-layer and
// global-SHAP-summary pattern. Reads the STEP46B per-grid SHAP consensus
// shares (model attribution, not per-grid causality, not IRC, not Policy
// Contribution) and writes a compact grid_id-keyed JSON lookup for the
// dashboard's grid-detail panel. Not part of postinstall/build: rerun
// manually if STEP46B output changes.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';

const source = path.resolve('../documentation/step45_modeling/data');
const read = async n => (await readFile(path.join(source, n), 'utf8')).replace(/^﻿/, '');
const json = async n => JSON.parse(await read(n));

function csv(s) {
  const rows = [];
  let row = [], v = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') { if (q && s[i + 1] === '"') { v += '"'; i++; } else q = !q; }
    else if (c === ',' && !q) { row.push(v); v = ''; }
    else if (c === '\n' && !q) { row.push(v.replace(/\r$/, '')); rows.push(row); row = []; v = ''; }
    else v += c;
  }
  if (v) { row.push(v.replace(/\r$/, '')); rows.push(row); }
  const keys = rows.shift();
  return rows.filter(r => r.length === keys.length).map(r => Object.fromEntries(keys.map((k, i) => [k, r[i]])));
}

const gate = await json('STEP46B_SHAP_PER_GRID_GATE.json');
if (gate.frontend_dashboard_consumption_authorized !== true)
  throw new Error('STEP46B gate does not authorize dashboard consumption; review before shipping this data.');
if (gate.irc_constructed !== false || gate.policy_contribution_percent_claim !== false || gate.causal_attribution_claim_authorized !== false)
  throw new Error('STEP46B gate no longer marks IRC/Policy Contribution/causal claims as unauthorized; review before shipping this data.');

const rows = csv(await read('STEP46B_SHAP_PER_GRID_ATTRIBUTION.csv'));
const FEATURES = [
  'max_event_antecedent_rainfall_3d_mm',
  'max_event_antecedent_rainfall_7d_mm',
  'slope_mean_deg',
  'distance_to_river_m',
];

const perGrid = {};
for (const r of rows) {
  perGrid[r.grid_id] = FEATURES.map(f => Math.round(Number(r[`consensus_share_${f}`]) * 10000) / 10000);
}

const summary = {
  source: {
    step: '46B',
    shap_role: gate.shap_role,
    consensus_method: 'row_wise_normalize_by_abs_sum_then_average_across_components',
    features: FEATURES,
    grid_count: Object.keys(perGrid).length,
  },
  perGrid,
};

await mkdir('public/data/interpretation', {recursive: true});
await writeFile('public/data/interpretation/shap-per-grid.json', JSON.stringify(summary));
console.log(JSON.stringify({status: 'PASS', grids: summary.source.grid_count}, null, 2));
