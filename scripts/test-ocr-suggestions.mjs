#!/usr/bin/env node
/**
 * Unit tests for LROCR.suggestions() — bare CN scoreboard parse.
 * Run: node scripts/test-ocr-suggestions.mjs
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function load() {
  const catalog = fs.readFileSync(path.join(root, 'app/js/catalog.js'), 'utf8');
  const ocr = fs.readFileSync(path.join(root, 'app/js/ocr.js'), 'utf8');
  const sandbox = {
    console,
    RegExp,
    Number,
    String,
    Object,
    Array,
    Math,
    JSON,
    Promise,
    URL,
    Map,
    Set,
    fetch: async () => ({ ok: false, headers: { get: () => '' } }),
  };
  sandbox.window = sandbox;
  sandbox.document = {
    createElement: () => ({ style: {}, remove() {}, setPointerCapture() {} }),
    head: { appendChild() {} },
    body: { appendChild() {} },
  };
  sandbox.LR = {
    lang: 'sc',
    raw: (k) => k,
    t: (k) => k,
    esc: (s) => String(s),
    toast() {},
    onLang() {},
  };
  vm.runInNewContext(catalog + '\n' + ocr, sandbox, { filename: 'ocr-bundle.js' });
  return sandbox.LROCR;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function same(a, b, msg) {
  assert(JSON.stringify(a) === JSON.stringify(b), `${msg}: got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`);
}

const LROCR = load();
let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ok ', name);
  } catch (e) {
    console.error(' FAIL', name, '-', e.message);
    process.exitCode = 1;
  }
}

console.log('LROCR.suggestions — bare KDA / score parse\n');

// --- Bug-report sample strings (before: k/d/a/score empty) ---
test('sample02 bare 30/16/2 fills k/d/a', () => {
  const text = `胜利 霓虹町
战斗表现评分
Reyna ACS
player 474
30/16/2
Econ 60`;
  const s = LROCR.suggestions(text, 'val');
  same({ k: s.k, d: s.d, a: s.a, score: s.score }, { k: 30, d: 16, a: 2, score: 474 }, 'kda+score');
  assert(s.result === 'W', 'result W');
  assert(s.map === 'Split', 'map Split from 霓虹町');
  assert(s.agent === 'Reyna', 'agent Reyna');
});

test('sample04 Mint 80 6/16/5 fills score + kda', () => {
  const text = `败北 亚海悬城
贤者 Sage
Mint 80 6/16/5
First Blood 0`;
  const s = LROCR.suggestions(text, 'val');
  same({ k: s.k, d: s.d, a: s.a, score: s.score }, { k: 6, d: 16, a: 5, score: 80 }, 'row');
  assert(s.result === 'L', '败北 → L');
  assert(s.map === 'Ascent', '亚海悬城 → Ascent');
  assert(s.agent === 'Sage', 'Sage');
});

test('sample01 haven raze — no false Omen; bare kda+score', () => {
  // Noise includes word "Omen" on a non-KDA line (old bug: agent=Omen)
  const text = `败北 隐世修所
Movement options
Omen tip card ignored
雷兹 Raze
400 28/17/5
Combat Report`;
  const s = LROCR.suggestions(text, 'val');
  same({ k: s.k, d: s.d, a: s.a, score: s.score }, { k: 28, d: 17, a: 5, score: 400 }, 'row');
  assert(s.agent === 'Raze', `agent should be Raze, got ${s.agent}`);
  assert(s.map === 'Haven', '隐世修所');
  assert(s.result === 'L', '败北');
});

test('霓虹町 must not resolve agent Neon', () => {
  const text = `胜利\n霓虹町\nJett\n399 20/7/5`;
  const s = LROCR.suggestions(text, 'val');
  assert(s.map === 'Split', 'map');
  assert(s.agent === 'Jett', `agent Jett not Neon, got ${s.agent}`);
  same({ k: s.k, d: s.d, a: s.a, score: s.score }, { k: 20, d: 7, a: 5, score: 399 }, 'row');
});

test('labeled K/D/A still works', () => {
  const text = `K/D/A: 12/8/3\nPerformance Score: 220`;
  const s = LROCR.suggestions(text, 'val');
  same({ k: s.k, d: s.d, a: s.a, score: s.score }, { k: 12, d: 8, a: 3, score: 220 }, 'labeled');
});

test('partial prefill: only bare kda still returns fields', () => {
  const text = `some noise\n30/16/2\nmore noise`;
  const s = LROCR.suggestions(text, 'val');
  same({ k: s.k, d: s.d, a: s.a }, { k: 30, d: 16, a: 2 }, 'bare only');
  assert(LROCR.filledKeyCount(s) >= 1, 'at least kda counts as one key');
});

test('collapsed newlines whole-text fallback', () => {
  const text = `胜利 霓虹町 Reyna playerName 474 30/16/2 Econ`;
  const s = LROCR.suggestions(text, 'val');
  same({ k: s.k, d: s.d, a: s.a, score: s.score }, { k: 30, d: 16, a: 2, score: 474 }, 'collapsed');
});

if (!process.exitCode) {
  console.log(`\nAll ${passed} tests passed.`);
} else {
  console.error(`\nFailed (passed ${passed} before failure).`);
}
