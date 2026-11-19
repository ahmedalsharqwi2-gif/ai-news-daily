import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hudplan, planCard, validatePlan, CARD_TYPES} from '../pipeline/hudplan.mjs';

const scene = (over = {}) => ({title: 'عنوان الخبر', summary: 'ملخص الخبر', keyword: 'الذكاء', template: 'phenomenon', labels: [], values: [], duration: 12, words: [], ...over});

test('empty episode throws HUDPLAN_NO_SCENES', () => {
  assert.throws(() => hudplan({title: 'x', scenes: []}), /HUDPLAN_NO_SCENES/);
});

test('chart wins when values present', () => {
  const c = planCard(scene({values: [40, 70], labels: ['أ', 'ب']}));
  assert.equal(c.type, 'chart');
  assert.deepEqual(c.values, [40, 70]);
});

test('steps template becomes numbered list', () => {
  const c = planCard(scene({template: 'steps', labels: ['خطوة', 'خطوتين']}));
  assert.equal(c.type, 'list');
});

test('cause template with 2-4 labels becomes flow', () => {
  assert.equal(planCard(scene({template: 'cause', labels: ['أ', 'ب', 'ج']})).type, 'flow');
  assert.equal(planCard(scene({template: 'journey', labels: ['أ', 'ب']})).type, 'flow');
});

test('number in title becomes stat card with item grid', () => {
  const c = planCard(scene({title: 'إعلان وقّعته ١٠ حكومات', labels: ['أمريكا', 'بريطانيا', 'اليابان']}));
  assert.equal(c.type, 'stat');
  assert.equal(c.stat, '١٠');
  assert.equal(c.items.length, 3);
});

test('four-plus labels with no number become grid', () => {
  const c = planCard(scene({labels: ['أ', 'ب', 'ج', 'د']}));
  assert.equal(c.type, 'grid');
});

test('bare keyword falls back to chip card', () => {
  const c = planCard(scene({keyword: 'GPU'}));
  assert.equal(c.type, 'chip');
  assert.equal(c.keyword, 'GPU');
});

test('full plan validates and caps summary points', () => {
  const ep = {title: 'أخبار', scenes: Array.from({length: 7}, (_, i) => scene({title: 'خبر ' + i, keyword: 'ك' + i}))};
  const {plan} = hudplan(ep);
  assert.equal(plan.cards.length, 7);
  assert.equal(plan.summaryPoints.length, 5);
  assert.deepEqual(validatePlan(plan, 7), []);
});

test('validator rejects wrong card count and bad types', () => {
  const {plan} = hudplan({title: 'أخبار', scenes: [scene()]});
  assert.ok(validatePlan(plan, 2).length > 0);
  const bad = {...plan, cards: [{type: 'nope', headline: 'x'}]};
  assert.ok(validatePlan(bad, 1).some((p) => p.includes('unknown type')));
});

test('every emitted type is renderable', () => {
  const samples = [
    scene({values: [1, 2, 3]}),
    scene({template: 'steps', labels: ['أ', 'ب']}),
    scene({template: 'cause', labels: ['أ', 'ب']}),
    scene({title: 'رقم 42', labels: ['أ']}),
    scene({labels: ['أ', 'ب', 'ج', 'د']}),
    scene(),
  ];
  for (const s of samples) assert.ok(CARD_TYPES.includes(planCard(s).type));
});
