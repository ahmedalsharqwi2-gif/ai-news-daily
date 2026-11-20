// hudplan.mjs - plans the HUD-style diagram cards for one AI على السريع episode.
// Grammar extracted from the owner's reference reel (Manus-made, 2026-11-19):
// dark-navy grid + particles, persistent branded header, ONE animated diagram
// card per news point (chip, country grid, flow chain, numbered list, bars,
// big-stat circle), caption card at bottom. Zero stock footage, zero person.
// Fully deterministic: no model call, no quota spent. A card spec that fails
// validation never ships - the chain falls back to the classic template.

export const PALETTE = {
  bg: '#010816', panel: '#0a1733', card: '#0d1c3a',
  cyan: '#3ae2ff', cyanDim: '#46a0bc',
  orange: '#ff9032', orangeDim: '#f08837',
  text: '#e8f1ff', sub: '#9fb3d1',
};

export const CARD_TYPES = ['chip', 'stat', 'grid', 'flow', 'list', 'chart', 'react'];

const CAPS = {items: 10, flowItems: 4, listItems: 6, chartItems: 6, summaryPoints: 5};

const NUM_RE = /[0-9٠-٩]+(?:[.,][0-9٠-٩]+)?/;

// Picks the diagram card for one scene from its structured fields.
// Order matters: charts and explicit step/flow templates win over the
// number heuristic; a bare keyword with no structure becomes a chip card.
export function planCard(scene) {
  const labels = (scene.labels || []).filter((x) => typeof x === 'string' && x.trim()).slice(0, CAPS.items);
  const values = (scene.values || []).filter((v) => typeof v === 'number' && isFinite(v)).slice(0, CAPS.chartItems);
  const num = String((scene.title || '') + ' ' + (scene.summary || '')).match(NUM_RE);
  const base = {headline: scene.title, keyword: scene.keyword || ''};
  if (values.length >= 2) return {...base, type: 'chart', items: labels.slice(0, values.length), values};
  if (scene.template === 'steps' && labels.length >= 2) return {...base, type: 'list', items: labels.slice(0, CAPS.listItems)};
  if (['cause', 'journey'].includes(scene.template) && labels.length >= 2 && labels.length <= CAPS.flowItems) return {...base, type: 'flow', items: labels};
  if (num) return {...base, type: 'stat', stat: num[0], items: labels};
  if (labels.length >= 4) return {...base, type: 'grid', items: labels};
  return {...base, type: 'chip', keyword: base.keyword || labels[0] || 'AI', items: labels};
}

// Builds the whole-episode plan. Throws HUDPLAN_NO_SCENES on an empty episode
// and HUDPLAN_INVALID if validation finds problems.
export function hudplan(episode) {
  if (!episode || !Array.isArray(episode.scenes) || !episode.scenes.length) throw Error('HUDPLAN_NO_SCENES');
  const cards = episode.scenes.map((s) => planCard(s));
  const plan = {
    schema: 1,
    title: episode.title,
    keyword: episode.scenes[0].keyword || '',
    cards,
    summaryPoints: episode.scenes.map((s) => s.keyword || s.title).filter(Boolean).slice(0, CAPS.summaryPoints),
  };
  const problems = validatePlan(plan, episode.scenes.length);
  if (problems.length) throw Error('HUDPLAN_INVALID: ' + problems.join('; '));
  return {plan};
}

export function validatePlan(plan, sceneCount) {
  const problems = [];
  if (!plan || typeof plan !== 'object') return ['plan is not an object'];
  if (!Array.isArray(plan.cards)) return ['cards is not an array'];
  if (plan.cards.length !== sceneCount) problems.push('cards ' + plan.cards.length + ' != scenes ' + sceneCount);
  plan.cards.forEach((c, i) => {
    if (!CARD_TYPES.includes(c.type)) problems.push('card ' + i + ' unknown type ' + c.type);
    if (!c.headline || typeof c.headline !== 'string') problems.push('card ' + i + ' missing headline');
    if (c.type === 'stat' && (typeof c.stat !== 'string' || !c.stat.trim())) problems.push('card ' + i + ' stat missing');
    if (c.type === 'chart' && (!Array.isArray(c.values) || c.values.length < 2)) problems.push('card ' + i + ' chart needs >=2 values');
    if (['grid', 'flow', 'list'].includes(c.type) && (!Array.isArray(c.items) || c.items.length < 2)) problems.push('card ' + i + ' ' + c.type + ' needs >=2 items');
    if (Array.isArray(c.items) && c.items.length > CAPS.items) problems.push('card ' + i + ' too many items');
  });
  return problems;
}
