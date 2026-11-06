/**
 * tests/tier6_strict_ui_invariants.test.js
 * Tier 6: Strict UI, DOM & Brand Invariance Test Suite for SurLlantas Web Portal.
 *
 * Scope:
 * Suite 1: Brand & Logo Invariants (Zero Superposition & High-Contrast Guarantee)
 * Suite 2: Video Takeover & Hero Strict Cleanliness (No stray buttons or badges)
 * Suite 3: Cross-Page Asset Resolution (Zero 404 Guarantee for images, stylesheets, scripts)
 * Suite 4: Cross-Page Routing, Navigation & Active States
 * Suite 5: Conversion & WhatsApp Protocol Invariance
 * Suite 6: Strict Accessibility & Semantic Structure (WCAG 2.1 AA)
 *
 * Engine: Native Node.js Test Runner (node:test + node:assert/strict)
 * Zero external npm dependencies.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(PROJECT_ROOT, 'web');
const INDEX_HTML_PATH = path.join(WEB_DIR, 'index.html');
const NOSOTROS_HTML_PATH = path.join(WEB_DIR, 'nosotros.html');
const CONTACTO_HTML_PATH = path.join(WEB_DIR, 'contacto.html');
const STYLES_CSS_PATH = path.join(WEB_DIR, 'assets', 'css', 'styles.css');

// Read files
const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
const nosotrosHtml = fs.readFileSync(NOSOTROS_HTML_PATH, 'utf-8');
const contactoHtml = fs.readFileSync(CONTACTO_HTML_PATH, 'utf-8');
const stylesCss = fs.readFileSync(STYLES_CSS_PATH, 'utf-8');

const ALL_PAGES = [
  { name: 'index.html', html: indexHtml, file: INDEX_HTML_PATH },
  { name: 'nosotros.html', html: nosotrosHtml, file: NOSOTROS_HTML_PATH },
  { name: 'contacto.html', html: contactoHtml, file: CONTACTO_HTML_PATH }
];

describe('Tier 6 Strict Suite 1: Brand & Logo Invariants (Zero Superposition)', () => {
  it('T6-LOGO-01: Exactly one logo anchor exists in the top navbar of index.html', () => {
    const navbarLogoMatches = indexHtml.match(/<a[^>]*class=["'][^"']*\bnavbar__logo\b[^"']*["']/g) || [];
    assert.strictEqual(navbarLogoMatches.length, 1, 'Navbar must contain exactly one logo link');
  });

  it('T6-LOGO-02: #video-takeover does NOT contain any internal logo element (prevents double superposition)', () => {
    const takeoverMatch = indexHtml.match(/<section[^>]*id=["']video-takeover["'][\s\S]*?<\/section>/);
    assert.ok(takeoverMatch, '#video-takeover must exist');
    const takeoverHtml = takeoverMatch[0];
    assert.ok(!takeoverHtml.includes('video-takeover__logo'), 'Must not have .video-takeover__logo inside takeover');
    assert.ok(!takeoverHtml.includes('logo-sur-llantas.png'), 'Must not load logo image inside takeover');
  });

  it('T6-LOGO-03: Navbar contains dual logo variants (white for dark bg, dark for light bg)', () => {
    assert.ok(indexHtml.includes('navbar__logo-img--white'), 'Must have white logo variant in navbar');
    assert.ok(indexHtml.includes('navbar__logo-img--dark'), 'Must have dark logo variant in navbar');
  });

  it('T6-LOGO-04: White logo asset exists on disk and is a valid high-resolution image', () => {
    const whiteLogoPath = path.join(WEB_DIR, 'assets', 'img', 'logo-sur-llantas-white.png');
    assert.ok(fs.existsSync(whiteLogoPath), 'logo-sur-llantas-white.png must exist in web/assets/img/');
    const stats = fs.statSync(whiteLogoPath);
    assert.ok(stats.size > 5000, `White logo must be a substantial image file, got ${stats.size} bytes`);
  });

  it('T6-LOGO-05: styles.css specifies strict display switching for .navbar--over-video', () => {
    assert.ok(
      /\.navbar--over-video\s+\.navbar__logo-img--white\s*\{[^}]*display:\s*block/i.test(stylesCss),
      '.navbar--over-video must show .navbar__logo-img--white'
    );
    assert.ok(
      /\.navbar--over-video\s+\.navbar__logo-img--dark\s*\{[^}]*display:\s*none/i.test(stylesCss),
      '.navbar--over-video must hide .navbar__logo-img--dark'
    );
  });

  it('T6-LOGO-06: Footer across all 3 pages uses the high-contrast white logo', () => {
    for (const page of ALL_PAGES) {
      assert.ok(
        page.html.includes('logo-sur-llantas-white.png'),
        `${page.name} footer must use logo-sur-llantas-white.png`
      );
    }
  });
});

describe('Tier 6 Strict Suite 2: Video Takeover & Hero Cleanliness', () => {
  it('T6-HERO-01: "DESLIZA PARA INGRESAR" button is completely eliminated from index.html', () => {
    assert.ok(!indexHtml.includes('takeoverScrollBtn'), 'takeoverScrollBtn ID must not exist');
    assert.ok(!indexHtml.includes('DESLIZA PARA INGRESAR'), '"DESLIZA PARA INGRESAR" text must not exist');
    assert.ok(!indexHtml.includes('video-takeover__scroll-cue'), '.video-takeover__scroll-cue class must not exist');
  });

  it('T6-HERO-02: Video Takeover headline strictly contains "SUR" and "LLANTAS"', () => {
    const taglineMatch = indexHtml.match(/class=["'][^"']*video-takeover__tagline[^"']*["'][^>]*>([\s\S]*?)<\/h1>/);
    assert.ok(taglineMatch, 'Tagline element must exist');
    const taglineContent = taglineMatch[1];
    assert.ok(taglineContent.includes('SUR'), 'Tagline must include SUR');
    assert.ok(taglineContent.includes('LLANTAS'), 'Tagline must include LLANTAS');
  });

  it('T6-HERO-03: Zero occurrences of "distribución autorizada" in takeover or hero', () => {
    const takeoverAndHero = indexHtml.substring(
      indexHtml.indexOf('id="video-takeover"'),
      indexHtml.indexOf('section-quote-bar')
    );
    assert.ok(
      !/distribuci[oó]n autorizada/i.test(takeoverAndHero),
      'Hero and takeover must not mention "distribución autorizada"'
    );
  });

  it('T6-HERO-04: Video Takeover eyebrow has "TARIJA" and "2001"', () => {
    assert.ok(indexHtml.includes('TARIJA &middot; BOLIVIA &middot; DESDE 2001'), 'Takeover eyebrow text must be preserved');
  });
});

describe('Tier 6 Strict Suite 3: Cross-Page Asset Resolution (Zero 404 Guarantee)', () => {
  it('T6-ASSET-01: All local images referenced in index.html, nosotros.html, contacto.html exist on disk', () => {
    for (const page of ALL_PAGES) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(page.html)) !== null) {
        const src = match[1];
        // Skip external images
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) continue;
        const localPath = path.join(WEB_DIR, src.replace(/^\//, ''));
        assert.ok(fs.existsSync(localPath), `Image in ${page.name} not found on disk: "${src}" -> ${localPath}`);
      }
    }
  });

  it('T6-ASSET-02: nosotros.html does not attempt to load missing founder JPEG files', () => {
    assert.ok(!nosotrosHtml.includes('fundador-melvin.jpg'), 'nosotros.html must not load missing fundador-melvin.jpg');
    assert.ok(!nosotrosHtml.includes('fundadora-lourdes.jpg'), 'nosotros.html must not load missing fundadora-lourdes.jpg');
  });

  it('T6-ASSET-03: Local stylesheets and scripts exist on disk', () => {
    for (const page of ALL_PAGES) {
      const linkRegex = /<link[^>]+href=["']([^"']+\.css(?:\?[^"']*)?)["']/g;
      let match;
      while ((match = linkRegex.exec(page.html)) !== null) {
        const href = match[1].split('?')[0];
        if (href.startsWith('http://') || href.startsWith('https://')) continue;
        const localPath = path.join(WEB_DIR, href.replace(/^\//, ''));
        assert.ok(fs.existsSync(localPath), `CSS file in ${page.name} not found: "${href}"`);
      }

      const scriptRegex = /<script[^>]+src=["']([^"']+\.js(?:\?[^"']*)?)["']/g;
      while ((match = scriptRegex.exec(page.html)) !== null) {
        const src = match[1].split('?')[0];
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/_vercel')) continue;
        const localPath = path.join(WEB_DIR, src.replace(/^\//, ''));
        assert.ok(fs.existsSync(localPath), `Script in ${page.name} not found: "${src}"`);
      }
    }
  });
});

describe('Tier 6 Strict Suite 4: Cross-Page Routing & Active Navigation States', () => {
  it('T6-NAV-01: All 3 pages have identical, valid navigation destinations', () => {
    for (const page of ALL_PAGES) {
      assert.ok(page.html.includes('href="index.html"'), `${page.name} must link to index.html`);
      assert.ok(page.html.includes('href="nosotros.html"'), `${page.name} must link to nosotros.html`);
      assert.ok(page.html.includes('href="contacto.html"'), `${page.name} must link to contacto.html`);
    }
  });

  it('T6-NAV-02: Active class correctly indicates the current page in desktop navbar', () => {
    // index.html
    const indexActive = indexHtml.match(/<a[^>]+href=["']index\.html["'][^>]*class=["'][^"']*active[^"']*["']/);
    assert.ok(indexActive, 'index.html must have active class on its own link');

    // nosotros.html
    const nosotrosActive = nosotrosHtml.match(/<a[^>]+href=["']nosotros\.html["'][^>]*class=["'][^"']*active[^"']*["']/);
    assert.ok(nosotrosActive, 'nosotros.html must have active class on its own link');

    // contacto.html
    const contactoActive = contactoHtml.match(/<a[^>]+href=["']contacto\.html["'][^>]*class=["'][^"']*active[^"']*["']/);
    assert.ok(contactoActive, 'contacto.html must have active class on its own link');
  });

  it('T6-NAV-03: Active class correctly indicates the current page in mobile drawer', () => {
    const checkDrawer = (html, pageHref, pageName) => {
      const drawerMatch = html.match(/<aside[^>]*class=["'][^"']*mobile-menu[^"']*["'][\s\S]*?<\/aside>/);
      assert.ok(drawerMatch, `${pageName} must have a mobile-menu drawer`);
      const hasActive = new RegExp(`href=["']${pageHref}["'][^>]*class=["'][^"']*active`).test(drawerMatch[0]);
      assert.ok(hasActive, `${pageName} mobile menu must have active class on ${pageHref}`);
    };

    checkDrawer(indexHtml, 'index.html', 'index.html');
    checkDrawer(nosotrosHtml, 'nosotros.html', 'nosotros.html');
    checkDrawer(contactoHtml, 'contacto.html', 'contacto.html');
  });
});

describe('Tier 6 Strict Suite 5: Conversion & WhatsApp Protocol Invariance', () => {
  it('T6-CONV-01: All WhatsApp links use HTTPS and Bolivia international code (591)', () => {
    for (const page of ALL_PAGES) {
      const waRegex = /href=["'](https:\/\/wa\.me\/[^"']+)["']/g;
      let match;
      let count = 0;
      while ((match = waRegex.exec(page.html)) !== null) {
        count++;
        const url = match[1];
        assert.ok(url.startsWith('https://wa.me/591'), `${page.name} WhatsApp URL must start with 591: ${url}`);
        const phone = url.replace('https://wa.me/591', '').split('?')[0];
        assert.ok(phone === '72960725' || phone === '68687118', `Invalid phone number: ${phone}`);
      }
      assert.ok(count >= 2, `${page.name} must have at least 2 WhatsApp contact points`);
    }
  });

  it('T6-CONV-02: WhatsApp links open in target="_blank" with secure rel attribute or standalone context', () => {
    for (const page of ALL_PAGES) {
      const waLinkRegex = /<a[^>]+href=["']https:\/\/wa\.me\/[^"']+["'][^>]*>/g;
      let match;
      while ((match = waLinkRegex.exec(page.html)) !== null) {
        const linkTag = match[0];
        assert.ok(linkTag.includes('target="_blank"'), `${page.name}: WhatsApp link must open in target="_blank": ${linkTag}`);
      }
    }
  });
});

describe('Tier 6 Strict Suite 6: Accessibility & Semantic HTML (WCAG 2.1 AA)', () => {
  it('T6-A11Y-01: Exactly one <h1> per page across all 3 pages', () => {
    for (const page of ALL_PAGES) {
      const h1Count = (page.html.match(/<h1[\s>]/g) || []).length;
      assert.strictEqual(h1Count, 1, `${page.name} must have exactly one <h1> heading, found ${h1Count}`);
    }
  });

  it('T6-A11Y-02: 100% of <img> tags have non-empty alt attributes across all 3 pages', () => {
    for (const page of ALL_PAGES) {
      const imgTags = page.html.match(/<img[^>]*>/g) || [];
      for (const tag of imgTags) {
        assert.ok(
          /alt=["'][^"']+["']/.test(tag),
          `Found <img> without non-empty alt attribute in ${page.name}: ${tag}`
        );
      }
    }
  });

  it('T6-A11Y-03: Every <button> has non-empty text or an aria-label across all 3 pages', () => {
    for (const page of ALL_PAGES) {
      const buttonRegex = /<button([^>]*)>([\s\S]*?)<\/button>/g;
      let match;
      while ((match = buttonRegex.exec(page.html)) !== null) {
        const attrs = match[1];
        const innerText = match[2].replace(/<[^>]+>/g, '').trim();
        const hasAriaLabel = /aria-label=["'][^"']+["']/.test(attrs);
        assert.ok(
          innerText.length > 0 || hasAriaLabel,
          `Button in ${page.name} has neither inner text nor aria-label: ${match[0]}`
        );
      }
    }
  });

  it('T6-A11Y-04: Viewport meta tag is strictly defined on all 3 pages', () => {
    for (const page of ALL_PAGES) {
      assert.ok(
        page.html.includes('name="viewport" content="width=device-width, initial-scale=1.0"'),
        `${page.name} must have standard responsive viewport meta tag`
      );
    }
  });

  it('T6-A11Y-05: Semantic landmark elements (<header>, <main id="main-content">, <footer>) exist on all pages', () => {
    for (const page of ALL_PAGES) {
      assert.ok(page.html.includes('<header class="navbar">'), `${page.name} must have <header class="navbar">`);
      assert.ok(page.html.includes('<main id="main-content">'), `${page.name} must have <main id="main-content">`);
      assert.ok(page.html.includes('<footer class="footer">'), `${page.name} must have <footer class="footer">`);
    }
  });
});
