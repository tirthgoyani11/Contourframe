import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeScene, renderScene, sample } from '../scene.js';

test('the sample is valid and moves the camera between endpoints', () => {
  assert.deepEqual(normalizeScene(sample), sample);
  assert.match(renderScene(sample, 0), /translate\(0 0\) scale\(1\)/);
  assert.match(renderScene(sample, 1), /translate\(-185 -77\) scale\(1\.29\)/);
});

test('edited colors and titles are rendered safely', () => {
  const svg = renderScene({ ...sample, title: '<edited & saved>', highlight: '#009999' }, .5);
  assert.match(svg, /&lt;edited &amp; saved&gt;/);
  assert.match(svg, /fill="#009999"/);
});

test('invalid settings fall back or clamp to the editor range', () => {
  assert.deepEqual(normalizeScene({ title: ' ', highlight: 'bad', duration: 'NaN' }), sample);
  assert.equal(normalizeScene({ ...sample, duration: 100 }).duration, 12);
  assert.equal(renderScene(sample, 3), renderScene(sample, 1));
});
