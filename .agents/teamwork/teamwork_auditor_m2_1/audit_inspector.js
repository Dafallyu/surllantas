const fs = require('fs');
const path = require('path');

const ROOT = 'd:/Proyectos/SurLlantas';
const html = fs.readFileSync(path.join(ROOT, 'web/index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'web/assets/css/styles.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'web/assets/js/main.js'), 'utf8');
const vercel = fs.readFileSync(path.join(ROOT, 'web/vercel.json'), 'utf8');

console.log('====================================================');
console.log('   SURLLANTAS MILESTONE 2 FORENSIC INTEGRITY AUDIT  ');
console.log('====================================================\n');

// 1. Inspect DOM elements in web/index.html
console.log('--- 1. DOM Elements in web/index.html ---');
const expectedIds = [
  'heroStage',
  'cinematicTireStage',
  'tireContactShadow',
  'tire3DWrapper',
  'tireMorphContainer',
  'tireImgFrente',
  'tireImg45',
  'telemetryLayer',
  'hotspot-tread',
  'hotspot-casing',
  'hotspot-efficiency',
  'card-tread',
  'card-casing',
  'card-efficiency',
  'quoteTireDock'
];

let domPass = true;
for (const id of expectedIds) {
  const needle = 'id="' + id + '"';
  const found = html.includes(needle);
  console.log(`  [DOM] ${id.padEnd(22)} : ${found ? 'PASS' : 'FAIL'}`);
  if (!found) domPass = false;
}

// 2. Check GSAP Script tags in index.html
console.log('\n--- 2. Script tags in web/index.html ---');
const gsapCdn = html.includes('cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
const scrollTriggerCdn = html.includes('cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
console.log(`  [CDN] GSAP 3.12.5 Core         : ${gsapCdn ? 'PASS' : 'FAIL'}`);
console.log(`  [CDN] ScrollTrigger Plugin     : ${scrollTriggerCdn ? 'PASS' : 'FAIL'}`);

// 3. Inspect CSS Tokens and Rules in web/assets/css/styles.css
console.log('\n--- 3. CSS Tokens & Declarations in web/assets/css/styles.css ---');
const expectedTokens = [
  '--color-automotive-dark: #0B0F17',
  '--color-electric-blue: #0066FF',
  '--color-brand-red: #D32F2F',
  '--color-glass-surface: rgba(11, 15, 23, 0.82)',
  '--color-glass-border: rgba(255, 255, 255, 0.12)',
  '--color-glass-fallback: rgba(11, 15, 23, 0.95)'
];

let cssPass = true;
for (const token of expectedTokens) {
  const found = css.includes(token);
  console.log(`  [CSS Token] ${token.padEnd(46)} : ${found ? 'PASS' : 'FAIL'}`);
  if (!found) cssPass = false;
}

const expectedCssRules = [
  { name: '350vh virtual track', needle: 'height: 350vh;' },
  { name: 'contain paint layout', needle: 'contain: paint layout;' },
  { name: 'perspective 1200px', needle: 'perspective: 1200px;' },
  { name: 'transform-style preserve-3d', needle: 'transform-style: preserve-3d;' },
  { name: 'backdrop-filter blur(16px)', needle: 'backdrop-filter: blur(16px);' },
  { name: '-webkit-backdrop-filter blur(16px)', needle: '-webkit-backdrop-filter: blur(16px);' },
  { name: 'reduced motion fallback media query', needle: '@media (prefers-reduced-motion: reduce)' }
];

for (const rule of expectedCssRules) {
  const found = css.includes(rule.needle);
  console.log(`  [CSS Rule]  ${rule.name.padEnd(40)} : ${found ? 'PASS' : 'FAIL'}`);
  if (!found) cssPass = false;
}

// 4. Inspect JS Logic in web/assets/js/main.js
console.log('\n--- 4. JS Implementation Logic in web/assets/js/main.js ---');
const expectedJsLogic = [
  { name: 'GSAP timeline registration', needle: 'gsap.timeline({' },
  { name: 'Phase 1 to 4 labels', needle: "masterTimeline.addLabel('phase1-start', 0.00)" },
  { name: 'Linear typography unblur', needle: "filter: 'blur(0px)'" },
  { name: 'Shadow matrix scaleX trig', needle: 'const scaleX = 1 + 0.15 * sinVal;' },
  { name: 'Shadow matrix skewX trig', needle: 'const rawSkewX = -0.35 * sinVal;' },
  { name: 'Shadow matrix scaleY trig', needle: 'const scaleY = 1 - 0.25 * sinVal;' },
  { name: 'Shadow matrix translation tx', needle: 'const tx = 20 * p;' },
  { name: 'Shadow matrix translation ty', needle: 'const ty = 10 * p;' },
  { name: 'TelemetryController class', needle: 'class TelemetryController' },
  { name: 'Telemetry outside click handler', needle: 'handleOutsideClick(e)' },
  { name: 'Telemetry Escape key handler', needle: "e.key === 'Escape'" },
  { name: 'TireLandingQuoteBridge class', needle: 'class TireLandingQuoteBridge' },
  { name: 'Reduced-motion bail-out in JS', needle: "window.matchMedia('(prefers-reduced-motion: reduce)')" },
  { name: 'Missing GSAP graceful return', needle: "typeof window.gsap === 'undefined'" }
];

let jsPass = true;
for (const item of expectedJsLogic) {
  const found = js.includes(item.needle);
  console.log(`  [JS Logic]  ${item.name.padEnd(40)} : ${found ? 'PASS' : 'FAIL'}`);
  if (!found) jsPass = false;
}

// 5. Inspect Vercel CSP in web/vercel.json
console.log('\n--- 5. CSP Configuration in web/vercel.json ---');
const cdnjsInCsp = vercel.includes('https://cdnjs.cloudflare.com');
const jsdelivrInCsp = vercel.includes('https://cdn.jsdelivr.net');
console.log(`  [CSP] cdnjs origin allowed     : ${cdnjsInCsp ? 'PASS' : 'FAIL'}`);
console.log(`  [CSP] jsdelivr origin allowed   : ${jsdelivrInCsp ? 'PASS' : 'FAIL'}`);

console.log('\n====================================================');
const overall = domPass && gsapCdn && scrollTriggerCdn && cssPass && jsPass && cdnjsInCsp && jsdelivrInCsp;
console.log(`OVERALL STATIC SOURCE CODE FORENSICS VERDICT: ${overall ? 'CLEAN' : 'INTEGRITY VIOLATION'}`);
console.log('====================================================');
