/**
 * Contract check: every OpenLoyalty call this service makes must exist in the
 * vendored spec.
 *
 * The BFF is the only seam between the apps and the loyalty platform, and the
 * plan is to repoint it at a real OpenLoyalty instance by changing a base URL.
 * That only holds if nothing here depends on a path the real platform does not
 * serve — a mock that has drifted ahead of the spec would let a call pass in
 * dev and 404 in production.
 *
 * Paths are read out of the source rather than exercised at runtime, so the
 * check needs no server and cannot be fooled by a mock that happens to answer.
 *
 *   node apps/backend/scripts/contract-check.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const backendSrc = join(here, '..', 'src');
const specPath = join(here, '..', '..', '..', 'spec', 'openloyalty-openapi.json');

const spec = JSON.parse(readFileSync(specPath, 'utf8'));

/** Every `.ts` file under the backend source tree. */
function sources(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sources(full);
    return full.endsWith('.ts') ? [full] : [];
  });
}

/**
 * Template literals interpolate the store code and ids. Normalising them to the
 * spec's own placeholders is what makes the two comparable.
 */
function toSpecPath(raw) {
  return raw
    .replace(/^\$\{baseUrl\}/, '')
    .replace(/\$\{s\(\)\}/g, '/api/{storeCode}')
    .replace(/\$\{storeCode\}/g, '{storeCode}')
    .replace(/\$\{[^}]+\}/g, '{param}');
}

const isParam = (seg) => seg.startsWith('{') && seg.endsWith('}');

/**
 * Best spec path for a candidate.
 *
 * Scored rather than first-match: `/campaign/simulate` also fits
 * `/campaign/{campaign}` if a placeholder is allowed to swallow a literal, and
 * taking the first hit would report the wrong path's methods. Literal-to-literal
 * segments score highest, so the exact route wins.
 */
function findSpecPath(candidate, method) {
  const want = candidate.split('/');
  let best = null;

  for (const specPath of Object.keys(spec.paths)) {
    const have = specPath.split('/');
    if (have.length !== want.length) continue;

    let score = 0;
    let fits = true;
    for (let i = 0; i < have.length; i++) {
      const a = have[i];
      const b = want[i];
      if (!isParam(a) && !isParam(b)) {
        if (a !== b) { fits = false; break; }
        score += 2;
      } else if (isParam(a) && isParam(b)) {
        score += 1;
      } else if (isParam(a)) {
        // A spec placeholder standing in for one of our literals is a weaker
        // match than an exact route of the same shape.
        score += 0;
      } else {
        fits = false;
        break;
      }
    }
    if (!fits) continue;
    // Prefer a path that actually serves the method we send.
    const serves = Boolean(spec.paths[specPath][method]) ? 1 : 0;
    const total = score * 2 + serves;
    if (!best || total > best.total) best = { specPath, total };
  }

  return best?.specPath;
}

/** Every upstream call site: a template-literal path plus its HTTP method. */
function calls() {
  const found = [];
  for (const file of sources(backendSrc)) {
    const text = readFileSync(file, 'utf8');
    // `request(...)` / `fetch(...)` with a backtick path, optionally followed by
    // an options object naming a method. Default is GET, as in fetch itself.
    const re = /(?:request|fetch)\s*<?[^(]*\(\s*`([^`]+)`\s*(?:,\s*\{([\s\S]{0,400}?)\})?/g;
    let m;
    while ((m = re.exec(text))) {
      const rawPath = m[1];
      if (!rawPath.includes('/api/') && !rawPath.includes('${s()}')) continue;
      const method = (m[2]?.match(/method:\s*'([A-Z]+)'/)?.[1] ?? 'GET').toLowerCase();
      found.push({ file: file.replace(`${backendSrc}/`, ''), rawPath, method });
    }
  }
  return found;
}

const results = calls().map((call) => {
  const candidate = toSpecPath(call.rawPath);
  const specPath = findSpecPath(candidate, call.method);
  const ok = Boolean(specPath && spec.paths[specPath][call.method]);
  return { ...call, candidate, specPath, ok };
});

const failures = results.filter((r) => !r.ok);

console.log(`OpenLoyalty contract check — ${results.length} call sites\n`);
for (const r of results.sort((a, b) => a.candidate.localeCompare(b.candidate))) {
  const mark = r.ok ? 'OK  ' : 'FAIL';
  console.log(`  ${mark}  ${r.method.toUpperCase().padEnd(6)} ${r.candidate}`);
  if (!r.ok) {
    console.log(
      `        ${r.specPath ? `path exists but has no ${r.method.toUpperCase()}` : 'no such path in the spec'} — ${r.file}`,
    );
  }
}

if (results.length === 0) {
  console.error('\nNo call sites found — the extractor is probably broken.');
  process.exit(1);
}
if (failures.length > 0) {
  console.error(`\n${failures.length} call(s) are not in the spec.`);
  process.exit(1);
}
console.log('\nEvery outgoing call is in the vendored OpenLoyalty spec.');
