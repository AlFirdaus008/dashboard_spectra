// Additive, out-of-STEP54-contract summary that mirrors the map context-layer pattern.
// Reads the already-gated STEP46 global SHAP consensus importance (model attribution,
// not per-grid, not IRC, not Policy Contribution) and writes a small committed JSON file.
// Not part of postinstall/build: rerun manually if STEP46 outputs change.
import {readFile, writeFile} from 'node:fs/promises';
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

const gate = await json('STEP46_INTERPRETATION_POLICY_OVERLAY_GATE.json');
const consensus = csv(await read('STEP46_SHAP_CONSENSUS_IMPORTANCE.csv'));

const summary = {
  source: {
    step: 46,
    scope: gate.scope,
    shap_role: gate.shap_role,
    irc_constructed: gate.irc_constructed,
    policy_contribution_percent_claim: gate.policy_contribution_percent_claim,
    policy_shap_claim: gate.policy_shap_claim,
    successful_shap_components: gate.successful_shap_components,
    failed_shap_components: gate.failed_shap_components,
    primary_model: gate.primary_model,
  },
  features: consensus
    .map(r => ({
      feature: r.feature,
      rank: Number(r.rank),
      consensus_normalized_importance: Number(r.consensus_normalized_importance),
      direction: r.empirical_attribution_direction,
      mean_direction_rho: Number(r.mean_direction_rho),
    }))
    .sort((a, b) => a.rank - b.rank),
};

if (gate.irc_constructed !== false || gate.policy_contribution_percent_claim !== false)
  throw new Error('STEP46 gate no longer marks IRC/Policy Contribution as unclaimed; review before shipping this summary.');

await writeFile('lib/data/shap-summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({status: 'PASS', features: summary.features.length}, null, 2));
