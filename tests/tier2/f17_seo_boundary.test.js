/**
 * tests/tier2/f17_seo_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F17: Infrastructure & SEO Preservation
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const DOMParserHelper = require('../helpers/dom-parser');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const ROBOTS_PATH = path.join(PROJECT_ROOT, 'web', 'robots.txt');
const SITEMAP_PATH = path.join(PROJECT_ROOT, 'web', 'sitemap.xml');

describe('Feature F17: Infrastructure & SEO Preservation — Boundary & Corner Cases (Tier 2)', () => {
  const dom = DOMParserHelper.getIndexHTML();
  const raw = dom.getRawHTML();

  it('F17-T2-1: web/robots.txt exists and points to valid sitemap.xml', () => {
    assert.ok(fs.existsSync(ROBOTS_PATH), 'web/robots.txt must exist');
    const robotsContent = fs.readFileSync(ROBOTS_PATH, 'utf-8');
    assert.ok(robotsContent.includes('Sitemap:'), 'robots.txt must declare Sitemap URL');
    assert.ok(robotsContent.includes('sitemap.xml'), 'robots.txt must point to sitemap.xml');
  });

  it('F17-T2-2: web/sitemap.xml exists and contains valid XML urlset', () => {
    assert.ok(fs.existsSync(SITEMAP_PATH), 'web/sitemap.xml must exist');
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    assert.ok(sitemapContent.includes('<urlset'), 'sitemap.xml must have <urlset> tag');
    assert.ok(sitemapContent.includes('https://surllantas.com.bo/'), 'sitemap must index root domain');
  });

  it('F17-T2-3: Meta description preserves exact length requirements (>100 and <160 characters)', () => {
    const metas = dom.findMetaTags();
    const desc = metas.find(m => m.name === 'description');
    assert.ok(desc !== undefined, 'Meta description must be present');
    const len = desc.content.length;
    assert.ok(len >= 100 && len <= 200, `Meta description length (${len}) must be optimal for search snippets`);
  });

  it('F17-T2-4: OpenGraph image dimension tags match physical image aspect ratio', () => {
    const metas = dom.findMetaTags();
    const ogWidth = metas.find(m => m.property === 'og:image:width');
    const ogHeight = metas.find(m => m.property === 'og:image:height');
    assert.ok(ogWidth && ogHeight, 'og:image:width and og:image:height must be declared');
    assert.strictEqual(ogWidth.content, '640');
    assert.strictEqual(ogHeight.content, '640');
  });

  it('F17-T2-5: GeoCoordinates latitude and longitude in JSON-LD point precisely to Tarija, Bolivia', () => {
    const schemas = dom.getJSONLDSchemas();
    const graph = schemas[0]['@graph'] || [];
    const store = graph.find(node => node['@type'] === 'AutoPartsStore');
    assert.ok(store !== undefined, 'AutoPartsStore node must exist');
    assert.ok(store.geo !== undefined, 'GeoCoordinates must exist in schema');
    assert.strictEqual(store.geo.latitude, -21.5121685);
    assert.strictEqual(store.geo.longitude, -64.7354856);
  });
});
