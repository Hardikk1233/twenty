// Content validator. Run with `npm run validate` (also runs before every build).
// Fails on errors; prints warnings. Add --verbose to list table rows and prose figures it skipped,
// and --only=4-6,9 to report only on those days (cross-day checks such as duplicate terms still run).

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURRICULUM, TOTAL_DAYS } from '../src/content/curriculum';
import { BRIEF_FIELDS } from '../src/content/types';
import { figures, identities, lineItems, published, type Period } from '../content/brewlane';
import { ASKS } from './lib/asks';
import { evaluate, roundTo } from './lib/expr';
import { countWords, plain, sentences, unsupportedChars } from './lib/text';

const LIMITS = {
  words: 850,
  whySentences: [2, 3] as const,
  terms: [3, 6] as const,
  explainSentences: 2,
  definitionSentences: 2,
  speakWords: [40, 110] as const,
  conceptWords: 6,
  quizCounts: { concept: 2, calc: 2, client: 1, builder: 1 } as Record<string, number>,
};

const verbose = process.argv.includes('--verbose');
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const onlyDays: Set<number> | null = onlyArg
  ? new Set(
      onlyArg
        .slice('--only='.length)
        .split(',')
        .flatMap((part) => {
          const [a, b] = part.split('-').map(Number);
          if (!a) return [];
          return Array.from({ length: (b || a) - a + 1 }, (_, i) => a + i);
        }),
    )
  : null;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const daysDir = process.env.TWENTY_CONTENT_DIR ?? join(root, 'content', 'days');

type Level = 'error' | 'warning';
const issues: { level: Level; where: string; message: string }[] = [];
const error = (where: string, message: string) => void issues.push({ level: 'error', where, message });
const warn = (where: string, message: string) => void issues.push({ level: 'warning', where, message });
const notes: string[] = [];

const stats = { tableCells: 0, calcChecks: 0, publishedChecks: 0, identityChecks: 0 };
const pad2 = (n: number) => String(n).padStart(2, '0');
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const decimals = (x: number) => (String(x).split('.')[1] ?? '').length;

function onlyKeys(o: Record<string, unknown>, allowed: string[], where: string) {
  for (const k of Object.keys(o)) if (!allowed.includes(k)) error(where, `unexpected field "${k}"`);
}

function str(v: unknown, where: string): string {
  if (typeof v !== 'string' || !v.trim()) {
    error(where, 'must be a non-empty string');
    return '';
  }
  if (v !== v.trim()) warn(where, 'has leading or trailing spaces');
  const bad = unsupportedChars(v);
  if (bad.length) error(where, `uses characters the font cannot draw: ${bad.join(' ')}`);
  if (/[–—]/.test(v)) error(where, 'uses an en or em dash; use a colon, comma, full stop or "to"');
  if (/[‘’“”]/.test(v)) error(where, "uses curly quotes; write plain ' and the app makes them typographic");
  return v;
}

function prose(v: unknown, where: string, allowTable = false): string {
  const s = str(v, where);
  if (s.replace(/\*\*[^*\n]+\*\*/g, '').includes('*')) error(where, 'has a stray * (only **bold** is supported)');
  if (/^#/m.test(s)) error(where, 'headings (#) are not supported in content');
  if (!allowTable && s.includes('{table}')) error(where, '{table} is only allowed in the worked example');
  return s;
}

function sentenceCount(s: string, where: string, min: number, max: number) {
  const n = sentences(s).length;
  if (n < min || n > max) {
    error(where, `has ${n} sentence${n === 1 ? '' : 's'}, expected ${min === max ? min : `${min} to ${max}`}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Brew Lane: identities, published figures, and statement-table lookups

for (const [what, left, right] of identities) {
  stats.identityChecks++;
  if (Math.abs(left - right) > 1e-9) error('content/brewlane.ts', `identity fails: ${what} (${left} vs ${right})`);
}
for (const [name, value, dp] of published) {
  stats.publishedChecks++;
  const computed = figures[name];
  if (computed === undefined) error('content/brewlane.ts', `published figure "${name}" is not computed`);
  else if (roundTo(computed, dp) !== value) {
    error('content/brewlane.ts', `${name} computes to ${computed}, brief says ${value}`);
  }
}

const normaliseLabel = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}%₹ ]/gu, ' ').replace(/\s+/g, ' ').trim();
const labelIndex = new Map<string, (typeof lineItems)[number]>();
for (const item of lineItems) for (const l of item.labels) labelIndex.set(normaliseLabel(l), item);

function periodsIn(text: string): Period[] {
  const t = text.toLowerCase();
  return (['24', '25', '26'] as Period[]).filter((p) => new RegExp(`\\bfy\\s?(20)?${p}\\b|\\b20${p}\\b`).test(t));
}

/** Every Brew Lane amount and ratio, for the verbose prose scan. */
const knownMagnitudes = new Set<number>(
  Object.values(figures).flatMap((v) => [Math.abs(v), roundTo(Math.abs(v), 1), roundTo(Math.abs(v), 0)]),
);

function firstNumber(s: string): number | null {
  const m = /-?\d[\d,]*(\.\d+)?/.exec(s.replace(/(\d),(?=\d)/g, '$1').replace(/−/g, '-'));
  return m ? Number(m[0]) : null;
}

function validateTable(t: unknown, where: string): number {
  if (!isObj(t)) {
    error(where, 'must be an object');
    return 0;
  }
  onlyKeys(t, ['caption', 'columns', 'rows'], where);
  const caption = str(t.caption, `${where}.caption`);
  if (!/₹|\$|%|crore|lakh|million|billion|days?|hours?|weeks?|months?|years?|score|times|ratio|fields|files|items|\bx\b/i.test(caption)) {
    warn(`${where}.caption`, 'should state the unit, e.g. "₹ crore"');
  }
  let words = countWords(caption);

  const columns = Array.isArray(t.columns) ? t.columns : [];
  if (!Array.isArray(t.columns) || columns.length === 0) error(`${where}.columns`, 'must be a non-empty array');
  columns.forEach((c, i) => (words += countWords(str(c, `${where}.columns[${i}]`))));

  const captionPeriods = periodsIn(caption);
  const colPeriods: (Period | null)[] = columns.map((c) => {
    const own = typeof c === 'string' ? periodsIn(c) : [];
    if (own.length === 1) return own[0]!;
    if (columns.length === 1 && captionPeriods.length === 1) return captionPeriods[0]!;
    return null;
  });

  if (!Array.isArray(t.rows) || t.rows.length === 0) {
    error(`${where}.rows`, 'must be a non-empty array');
    return words;
  }
  const showsBrewLane = t.rows.some(
    (r) => isObj(r) && typeof r.label === 'string' && labelIndex.has(normaliseLabel(r.label)),
  );
  if (showsBrewLane && !/year|as at|fy\d|quarter|month|20\d\d/i.test(caption)) {
    warn(`${where}.caption`, 'should state the period or date');
  }
  t.rows.forEach((r, i) => {
    const rw = `${where}.rows[${i}]`;
    if (!isObj(r)) return error(rw, 'must be an object');
    onlyKeys(r, ['label', 'values', 'rule', 'highlight', 'decimals'], rw);
    if (r.decimals !== undefined && !(Number.isInteger(r.decimals) && (r.decimals as number) >= 0 && (r.decimals as number) <= 3)) {
      error(`${rw}.decimals`, 'must be a whole number from 0 to 3');
    }
    const label = str(r.label, `${rw}.label`);
    words += countWords(label);
    if (r.rule !== undefined && r.rule !== 'subtotal' && r.rule !== 'total') {
      error(`${rw}.rule`, 'must be "subtotal" or "total"');
    }
    if (r.highlight !== undefined && typeof r.highlight !== 'boolean') error(`${rw}.highlight`, 'must be true or false');
    if (!Array.isArray(r.values) || r.values.length !== columns.length) {
      return error(`${rw}.values`, `must have one value per column (${columns.length})`);
    }
    const item = labelIndex.get(normaliseLabel(label));
    r.values.forEach((v, j) => {
      if (v === null) return;
      if (typeof v !== 'number' || !Number.isFinite(v)) return error(`${rw}.values[${j}]`, 'must be a number or null');
      const period = colPeriods[j] ?? null;
      if (!item || !period) {
        notes.push(`${rw} "${label}" [${String(columns[j])}] = ${v}: not checked against Brew Lane`);
        return;
      }
      const canonical = item.values[period];
      if (canonical === undefined) {
        return error(rw, `"${label}" has no Brew Lane figure for ${period === '26' ? 'FY26' : `20${period}`}; do not invent one`);
      }
      stats.tableCells++;
      if (roundTo(Math.abs(canonical), decimals(v)) !== Math.abs(v)) {
        error(rw, `"${label}" shows ${v} for ${String(columns[j])}, Brew Lane figure is ${canonical}`);
      }
    });
  });
  return words;
}

// ---------------------------------------------------------------------------------------------
// Questions

const questionIds = new Map<string, string>();

function validateQuestion(q: unknown, where: string, day: number) {
  if (!isObj(q)) return error(where, 'must be an object');
  const common = ['id', 'type', 'concept', 'prompt', 'explain', 'check', 'kind'];
  if (q.kind === 'choice') onlyKeys(q, [...common, 'options', 'answer'], where);
  else if (q.kind === 'number') onlyKeys(q, [...common, 'answer', 'tolerance', 'unit'], where);
  else error(`${where}.kind`, 'must be "choice" or "number"');

  const id = str(q.id, `${where}.id`);
  if (id && !id.startsWith(`d${pad2(day)}-`)) error(`${where}.id`, `must start with d${pad2(day)}-`);
  if (id && questionIds.has(id)) error(`${where}.id`, `duplicate id, also used in ${questionIds.get(id)}`);
  if (id) questionIds.set(id, where);

  if (!['concept', 'calc', 'client', 'builder'].includes(q.type as string)) {
    error(`${where}.type`, 'must be concept, calc, client or builder');
  }
  const concept = str(q.concept, `${where}.concept`);
  if (countWords(concept) > LIMITS.conceptWords) warn(`${where}.concept`, `keep it to ${LIMITS.conceptWords} words or fewer`);
  prose(q.prompt, `${where}.prompt`);
  const explain = prose(q.explain, `${where}.explain`);
  sentenceCount(explain, `${where}.explain`, 1, LIMITS.explainSentences);

  let target: number | null = null;
  let targetDecimals = 0;
  let tolerance = 0;
  if (q.kind === 'choice') {
    const options = Array.isArray(q.options) ? q.options : [];
    if (options.length !== 4) error(`${where}.options`, 'must have exactly four options');
    const texts = options.map((o, i) => str(o, `${where}.options[${i}]`));
    if (new Set(texts.map((t) => t.toLowerCase())).size !== texts.length) error(`${where}.options`, 'options must differ');
    if (!Number.isInteger(q.answer) || (q.answer as number) < 0 || (q.answer as number) > 3) {
      error(`${where}.answer`, 'must be 0, 1, 2 or 3');
    } else if (q.type === 'calc') {
      target = firstNumber(texts[q.answer as number] ?? '');
      if (target === null) error(`${where}.options`, 'the correct option of a calc question must contain a number');
      else {
        targetDecimals = decimals(target);
        const same = texts.filter((t, i) => i !== q.answer && firstNumber(t) === target);
        if (same.length) error(`${where}.options`, 'another option shows the same number as the answer');
      }
    }
  } else if (q.kind === 'number') {
    if (typeof q.answer !== 'number' || !Number.isFinite(q.answer)) error(`${where}.answer`, 'must be a number');
    else {
      target = q.answer;
      targetDecimals = decimals(q.answer);
    }
    if (typeof q.tolerance !== 'number' || !(q.tolerance >= 0)) error(`${where}.tolerance`, 'must be a number of 0 or more');
    else tolerance = q.tolerance;
    str(q.unit, `${where}.unit`);
    if (target !== null && tolerance > Math.max(0.5, Math.abs(target) * 0.05)) {
      warn(`${where}.tolerance`, 'is loose; learners could pass with a wrong method');
    }
  }

  if (q.type === 'calc' && q.check === undefined) error(`${where}.check`, 'calc questions need a check expression');
  if (q.check !== undefined) {
    const expr = str(q.check, `${where}.check`);
    if (expr && target !== null) {
      try {
        const value = evaluate(expr, figures);
        stats.calcChecks++;
        if (q.kind === 'number') {
          if (Math.abs(value - target) > tolerance + 1e-9) {
            error(`${where}.answer`, `is ${target}, but ${expr} = ${value}`);
          } else if (roundTo(value, targetDecimals) !== target) {
            warn(`${where}.answer`, `${target} is not ${value} rounded to ${targetDecimals} decimals`);
          }
        } else if (roundTo(value, targetDecimals) !== target) {
          error(`${where}.options`, `correct option shows ${target}, but ${expr} = ${value}`);
        }
      } catch (e) {
        error(`${where}.check`, (e as Error).message);
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Days

type Summary = { day: number; words: number; questions: number; terms: number; speakWords: number };
const summaries: Summary[] = [];
const glossary = new Map<string, string>();
const akaIndex: { aka: string; where: string }[] = [];

function scanProseFigures(text: string, where: string) {
  for (const m of plain(text).matchAll(/₹\s?(\d[\d,]*(?:\.\d+)?)\s?crore/g)) {
    const n = Number(m[1]!.replace(/,/g, ''));
    if (!knownMagnitudes.has(n)) notes.push(`${where}: "₹${m[1]} crore" is not a Brew Lane figure (fine if hypothetical)`);
  }
}

function validateDay(raw: unknown, file: string) {
  const where = file;
  if (!isObj(raw)) return error(where, 'must be a JSON object');
  onlyKeys(raw, ['day', 'phase', 'title', 'pages', 'quiz', 'speak', 'capstone'], where);

  const day = raw.day;
  if (!Number.isInteger(day) || (day as number) < 1 || (day as number) > TOTAL_DAYS) {
    return error(`${where}.day`, `must be a whole number from 1 to ${TOTAL_DAYS}`);
  }
  const n = day as number;
  if (file !== `day${pad2(n)}.json`) error(where, `file name should be day${pad2(n)}.json`);
  const plan = CURRICULUM[n - 1]!;
  if (raw.phase !== plan.phase) error(`${where}.phase`, `must be ${plan.phase} for day ${n}`);
  if (raw.title !== plan.title) error(`${where}.title`, `must be "${plan.title}"`);

  let words = 0;
  let termCount = 0;
  const pages = raw.pages;
  if (!isObj(pages)) error(`${where}.pages`, 'must be an object');
  else {
    onlyKeys(pages, ['why', 'idea', 'example', 'terms', 'builder', 'client'], `${where}.pages`);
    const why = prose(pages.why, `${where}.pages.why`);
    sentenceCount(why, `${where}.pages.why`, LIMITS.whySentences[0], LIMITS.whySentences[1]);
    const idea = prose(pages.idea, `${where}.pages.idea`);
    words += countWords(why) + countWords(idea);
    scanProseFigures(why, `${where}.pages.why`);
    scanProseFigures(idea, `${where}.pages.idea`);

    const ex = pages.example;
    if (!isObj(ex)) error(`${where}.pages.example`, 'must be an object');
    else {
      onlyKeys(ex, ['text', 'table'], `${where}.pages.example`);
      const text = prose(ex.text, `${where}.pages.example.text`, true);
      words += countWords(text);
      scanProseFigures(text, `${where}.pages.example.text`);
      const markers = text.split('\n\n').filter((p) => p.trim() === '{table}').length;
      if (text.includes('{table}') && markers !== 1) error(`${where}.pages.example.text`, '{table} must be its own paragraph, once');
      if (markers && ex.table === undefined) error(`${where}.pages.example.text`, '{table} marker but no table');
      if (ex.table !== undefined) words += validateTable(ex.table, `${where}.pages.example.table`);
    }

    if (!Array.isArray(pages.terms)) error(`${where}.pages.terms`, 'must be an array');
    else {
      termCount = pages.terms.length;
      if (termCount < LIMITS.terms[0] || termCount > LIMITS.terms[1]) {
        error(`${where}.pages.terms`, `has ${termCount} terms, expected ${LIMITS.terms[0]} to ${LIMITS.terms[1]}`);
      }
      pages.terms.forEach((t, i) => {
        const tw = `${where}.pages.terms[${i}]`;
        if (!isObj(t)) return error(tw, 'must be an object');
        onlyKeys(t, ['term', 'aka', 'definition', 'formula'], tw);
        const term = str(t.term, `${tw}.term`);
        const key = term.toLowerCase();
        if (glossary.has(key)) error(`${tw}.term`, `"${term}" is already defined in ${glossary.get(key)}`);
        glossary.set(key, tw);
        words += countWords(term);
        if (t.aka !== undefined) {
          if (!Array.isArray(t.aka) || t.aka.length === 0) error(`${tw}.aka`, 'must be a non-empty array when present');
          else
            t.aka.forEach((a, j) => {
              const s = str(a, `${tw}.aka[${j}]`);
              words += countWords(s);
              akaIndex.push({ aka: s.toLowerCase(), where: tw });
            });
        }
        const def = prose(t.definition, `${tw}.definition`);
        words += countWords(def);
        sentenceCount(def, `${tw}.definition`, 1, LIMITS.definitionSentences);
        if (countWords(def) > 30) warn(`${tw}.definition`, 'is long for a one-line definition');
        if (t.formula !== undefined) words += countWords(str(t.formula, `${tw}.formula`));
      });
    }

    const builder = prose(pages.builder, `${where}.pages.builder`);
    words += countWords(builder);
    scanProseFigures(builder, `${where}.pages.builder`);
    if (builder && !/check worth building/i.test(builder)) warn(`${where}.pages.builder`, 'should name one check worth building');

    const client = pages.client;
    if (!isObj(client)) error(`${where}.pages.client`, 'must be an object');
    else {
      onlyKeys(client, ['say', 'ask'], `${where}.pages.client`);
      const say = prose(client.say, `${where}.pages.client.say`);
      const ask = prose(client.ask, `${where}.pages.client.ask`);
      sentenceCount(say, `${where}.pages.client.say`, 1, 1);
      sentenceCount(ask, `${where}.pages.client.ask`, 1, 2);
      if (ask && !ask.includes('?')) error(`${where}.pages.client.ask`, 'must be a question');
      const briefAsk = ASKS[n];
      if (briefAsk && ask && ask !== briefAsk) {
        error(`${where}.pages.client.ask`, `must be the brief's ask, word for word: "${briefAsk}"`);
      }
      words += countWords(say) + countWords(ask);
    }
  }
  if (words > LIMITS.words) error(`${where}.pages`, `has ${words} words of reading; the limit is ${LIMITS.words}`);

  // Quiz
  const quiz = Array.isArray(raw.quiz) ? raw.quiz : [];
  if (!Array.isArray(raw.quiz) || quiz.length !== 6) error(`${where}.quiz`, 'must have exactly six questions');
  const counts: Record<string, number> = {};
  for (const q of quiz) if (isObj(q)) counts[q.type as string] = (counts[q.type as string] ?? 0) + 1;
  for (const [type, need] of Object.entries(LIMITS.quizCounts)) {
    if ((counts[type] ?? 0) !== need) error(`${where}.quiz`, `needs ${need} ${type} question${need > 1 ? 's' : ''}, has ${counts[type] ?? 0}`);
  }
  quiz.forEach((q, i) => {
    validateQuestion(q, `${where}.quiz[${i}]`, n);
    if (isObj(q) && typeof q.explain === 'string') scanProseFigures(q.explain, `${where}.quiz[${i}].explain`);
  });

  // Multiple-choice hygiene: the right answer should not give itself away.
  const choices = quiz.filter((q): q is Record<string, unknown> => isObj(q) && q.kind === 'choice' && Array.isArray(q.options));
  const longestIsRight = choices.filter((q) => {
    const lens = (q.options as string[]).map((o) => String(o).length);
    const right = lens[q.answer as number] ?? 0;
    return lens.every((l, i) => i === q.answer || l < right);
  }).length;
  if (longestIsRight >= 3) warn(`${where}.quiz`, `the correct option is the longest in ${longestIsRight} questions`);
  const positions = new Set(choices.map((q) => q.answer));
  if (choices.length >= 3 && positions.size === 1) warn(`${where}.quiz`, 'every correct option is in the same position');

  // Say it out loud
  let speakWords = 0;
  const speak = raw.speak;
  if (!isObj(speak)) error(`${where}.speak`, 'must be an object');
  else {
    onlyKeys(speak, ['prompt', 'modelAnswer'], `${where}.speak`);
    prose(speak.prompt, `${where}.speak.prompt`);
    const model = prose(speak.modelAnswer, `${where}.speak.modelAnswer`);
    speakWords = countWords(model);
    scanProseFigures(model, `${where}.speak.modelAnswer`);
    const [lo, hi] = LIMITS.speakWords;
    if (speakWords < lo || speakWords > hi) warn(`${where}.speak.modelAnswer`, `${speakWords} words; aim for ${lo} to ${hi} (about 30 seconds)`);
  }

  if (raw.capstone !== undefined || n === TOTAL_DAYS) validateCapstone(raw.capstone, `${where}.capstone`, n);

  summaries.push({ day: n, words, questions: quiz.length, terms: termCount, speakWords });
}

function validateCapstone(c: unknown, where: string, day: number) {
  if (day !== TOTAL_DAYS) return error(where, `only Day ${TOTAL_DAYS} has a capstone`);
  if (!isObj(c)) return error(where, `Day ${TOTAL_DAYS} needs a capstone with three clients`);
  onlyKeys(c, ['clients'], where);
  const clients = Array.isArray(c.clients) ? c.clients : [];
  if (clients.length !== 3) error(`${where}.clients`, 'needs exactly three mock clients');
  const ids = new Set<string>();
  clients.forEach((client, i) => {
    const cw = `${where}.clients[${i}]`;
    if (!isObj(client)) return error(cw, 'must be an object');
    onlyKeys(client, ['id', 'name', 'situation', 'model'], cw);
    const id = str(client.id, `${cw}.id`);
    if (id && !/^[a-z0-9-]+$/.test(id)) error(`${cw}.id`, 'use lowercase letters, digits and hyphens');
    if (ids.has(id)) error(`${cw}.id`, 'duplicate client id');
    ids.add(id);
    str(client.name, `${cw}.name`);
    const situation = prose(client.situation, `${cw}.situation`);
    const sw = countWords(situation);
    if (sw < 50 || sw > 130) warn(`${cw}.situation`, `${sw} words; aim for 50 to 130`);
    if (!isObj(client.model)) return error(`${cw}.model`, 'must be an object');
    onlyKeys(client.model, [...BRIEF_FIELDS], `${cw}.model`);
    for (const field of BRIEF_FIELDS) {
      const text = prose(client.model[field], `${cw}.model.${field}`);
      const fw = countWords(text);
      if (fw > 120) error(`${cw}.model.${field}`, `${fw} words; keep it under 120`);
      else if (fw < 15 || fw > 90) warn(`${cw}.model.${field}`, `${fw} words; aim for 15 to 90`);
    }
  });
}

// ---------------------------------------------------------------------------------------------
// Run

const files = readdirSync(daysDir).filter((f) => f.endsWith('.json')).sort();
for (const f of files) {
  if (!/^day\d{2}\.json$/.test(f)) {
    error(f, 'unexpected file name; use dayNN.json');
    continue;
  }
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(join(daysDir, f), 'utf8'));
  } catch (e) {
    error(f, `is not valid JSON: ${(e as Error).message}`);
    continue;
  }
  validateDay(data, f);
}

for (const { aka, where } of akaIndex) {
  const owner = glossary.get(aka);
  if (owner && owner !== where) warn(where, `alias "${aka}" is also a glossary term (${owner})`);
}

const days = summaries.map((s) => s.day).sort((a, b) => a - b);
const missing = CURRICULUM.map((c) => c.day).filter((d) => !days.includes(d));

console.log('\nTwenty content check\n');
console.log('Day  Words  Questions  Terms  Speak');
for (const s of summaries.sort((a, b) => a.day - b.day).filter((x) => !onlyDays || onlyDays.has(x.day))) {
  console.log(
    `${String(s.day).padStart(3)}  ${String(s.words).padStart(5)}  ${String(s.questions).padStart(9)}  ${String(s.terms).padStart(5)}  ${String(s.speakWords).padStart(4)}w`,
  );
}
console.log(
  `\nBrew Lane: ${stats.identityChecks} identities and ${stats.publishedChecks} published figures recomputed; ` +
    `${stats.tableCells} table cells and ${stats.calcChecks} calculation answers checked.`,
);
if (missing.length) console.log(`Not written yet: days ${missing[0]} to ${missing[missing.length - 1]} (${missing.length} days).`);

const dayOf = (where: string) => Number(/^day(\d{2})\.json/.exec(where)?.[1] ?? NaN);
const inScope = (where: string) => !onlyDays || Number.isNaN(dayOf(where)) || onlyDays.has(dayOf(where));

const shownNotes = notes.filter((n) => inScope(n));
if (verbose && shownNotes.length) {
  console.log('\nNot checked (review by eye):');
  for (const n of shownNotes) console.log(`  ${n}`);
}

const errors = issues.filter((i) => i.level === 'error' && inScope(i.where));
const warnings = issues.filter((i) => i.level === 'warning' && inScope(i.where));
for (const i of warnings) console.log(`warning  ${i.where}: ${i.message}`);
for (const i of errors) console.log(`error    ${i.where}: ${i.message}`);
console.log(`\n${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}.\n`);
process.exit(errors.length ? 1 : 0);
