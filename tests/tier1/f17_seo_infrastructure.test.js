/**
 * tests/tier1/f17_seo_infrastructure.test.js
 * Tier 1: Feature Coverage — Feature F17: Infrastructure & SEO Preservation
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const DOMParserHelper = require('../helpers/dom-parser');

describe('Feature F17: Infrastructure & SEO Preservation (Tier 1)', () => {
  const dom = DOMParserHelper.getIndexHTML();
  const raw = dom.getRawHTML();

  it('F17-T1-1: Exact head boundary lines 1 to 156 are preserved without truncation', () => {
    const headLines = dom.getHeadLines();
    assert.ok(headLines.length >= 150, `Head section must contain at least 150 lines (found ${headLines.length})`);
    assert.ok(raw.includes('<html lang="es">'), 'Must retain Spanish language attribute');
    assert.ok(raw.includes('<title>Sur Llantas | Venta de Llantas en Tarija desde 2001</title>'), 'Title must be intact');
  });

  it('F17-T1-2: Canonical link points to https://surllantas.com.bo/', () => {
    const links = dom.findLinkTags();
    const canonical = links.find(l => l.rel === 'canonical');
    assert.ok(canonical !== undefined, 'Canonical link must be present');
    assert.strictEqual(canonical.href, 'https://surllantas.com.bo/');
  });

  it('F17-T1-3: OpenGraph metadata tags are fully present and valid', () => {
    const metas = dom.findMetaTags();
    const ogSiteName = metas.find(m => m.property === 'og:site_name');
    const ogTitle = metas.find(m => m.property === 'og:title');
    const ogImage = metas.find(m => m.property === 'og:image');
    const ogUrl = metas.find(m => m.property === 'og:url');

    assert.ok(ogSiteName && ogSiteName.content === 'Sur Llantas Tarija', 'og:site_name must match');
    assert.ok(ogTitle && ogTitle.content.includes('Sur Llantas'), 'og:title must match');
    assert.ok(ogImage && ogImage.content.includes('og-surllantas.jpg'), 'og:image must match');
    assert.ok(ogUrl && ogUrl.content === 'https://surllantas.com.bo/', 'og:url must match');
  });

  it('F17-T1-4: JSON-LD @graph structured data contains AutoPartsStore and WebPage schemas', () => {
    const schemas = dom.getJSONLDSchemas();
    assert.ok(schemas.length > 0, 'At least one JSON-LD schema script must exist');
    const graph = schemas[0]['@graph'] || [];
    assert.ok(graph.length >= 3, 'JSON-LD @graph must define at least 3 schema nodes');

    const types = graph.map(node => node['@type']);
    assert.ok(types.includes('WebSite'), 'Must define WebSite schema');
    assert.ok(types.includes('WebPage'), 'Must define WebPage schema');
    assert.ok(types.includes('AutoPartsStore'), 'Must define AutoPartsStore schema');
  });

  it('F17-T1-5: Vercel Web Analytics and Speed Insights scripts are preserved', () => {
    assert.ok(raw.includes('window.va = window.va'), 'window.va stub must exist');
    assert.ok(raw.includes('/_vercel/insights/script.js'), 'Vercel insights script must be loaded');
    assert.ok(raw.includes('window.si = window.si'), 'window.si stub must exist');
    assert.ok(raw.includes('/_vercel/speed-insights/script.js'), 'Vercel speed insights script must be loaded');
  });
});
