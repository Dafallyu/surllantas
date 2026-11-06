/**
 * tests/helpers/dom-parser.js
 * Lightweight, zero-dependency HTML parser and DOM inspector for E2E tests.
 */
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const INDEX_HTML_PATH = path.join(PROJECT_ROOT, 'web', 'index.html');

class DOMParserHelper {
  constructor(htmlContent) {
    this.html = htmlContent || (fs.existsSync(INDEX_HTML_PATH) ? fs.readFileSync(INDEX_HTML_PATH, 'utf-8') : '');
  }

  static fromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return new DOMParserHelper(content);
  }

  static getIndexHTML() {
    return new DOMParserHelper();
  }

  getRawHTML() {
    return this.html;
  }

  getHeadLines() {
    const headMatch = this.html.match(/<head[\s\S]*?<\/head>/i);
    if (!headMatch) return [];
    return headMatch[0].split(/\r?\n/);
  }

  getElementById(id) {
    const regex = new RegExp(`<([a-zA-Z0-9-]+)[^>]*?id=["']${id}["'][^>]*?>([\\s\\S]*?<\\/\\1>)?`, 'i');
    const match = this.html.match(regex);
    if (!match) return null;
    return this._parseElement(match[0]);
  }

  getElementsByClassName(className) {
    const regex = new RegExp(`<([a-zA-Z0-9-]+)[^>]*?class=["'][^"']*?\\b${className}\\b[^"']*?["'][^>]*?>`, 'gi');
    const matches = this.html.match(regex) || [];
    return matches.map(m => this._parseElement(m));
  }

  getElementsByTagName(tagName) {
    const regex = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
    const matches = this.html.match(regex) || [];
    return matches.map(m => this._parseElement(m));
  }

  findScriptTags() {
    const regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    const scripts = [];
    let match;
    while ((match = regex.exec(this.html)) !== null) {
      const attrsStr = match[1];
      const inlineContent = match[2];
      const srcMatch = attrsStr.match(/src=["']([^"']+)["']/i);
      const defer = /defer\b/i.test(attrsStr);
      const async = /async\b/i.test(attrsStr);
      const typeMatch = attrsStr.match(/type=["']([^"']+)["']/i);
      scripts.push({
        raw: match[0],
        src: srcMatch ? srcMatch[1] : null,
        defer,
        async,
        type: typeMatch ? typeMatch[1] : null,
        content: inlineContent.trim()
      });
    }
    return scripts;
  }

  findMetaTags() {
    const regex = /<meta\b([^>]*)\/?>/gi;
    const metas = [];
    let match;
    while ((match = regex.exec(this.html)) !== null) {
      const attrs = this._extractAttributes(match[1]);
      metas.push(attrs);
    }
    return metas;
  }

  findLinkTags() {
    const regex = /<link\b([^>]*)\/?>/gi;
    const links = [];
    let match;
    while ((match = regex.exec(this.html)) !== null) {
      const attrs = this._extractAttributes(match[1]);
      links.push(attrs);
    }
    return links;
  }

  getJSONLDSchemas() {
    const scripts = this.findScriptTags();
    const ldJsonScripts = scripts.filter(s => s.type === 'application/ld+json');
    const parsedSchemas = [];
    for (const s of ldJsonScripts) {
      try {
        parsedSchemas.push(JSON.parse(s.content));
      } catch (e) {
        parsedSchemas.push({ error: e.message, raw: s.content });
      }
    }
    return parsedSchemas;
  }

  isElementPreceding(selectorA, selectorB) {
    // Check relative index in HTML string
    const idxA = this.html.indexOf(selectorA);
    const idxB = this.html.indexOf(selectorB);
    if (idxA === -1 || idxB === -1) return null;
    return idxA < idxB;
  }

  _parseElement(tagStr) {
    const tagMatch = tagStr.match(/^<([a-zA-Z0-9-]+)\b([^>]*)>/);
    if (!tagMatch) return { raw: tagStr, tag: 'unknown', attributes: {} };
    const tag = tagMatch[1];
    const attributes = this._extractAttributes(tagMatch[2]);
    return {
      raw: tagStr,
      tag,
      id: attributes.id || null,
      className: attributes.class || null,
      attributes
    };
  }

  _extractAttributes(attrStr) {
    const attrs = {};
    const regex = /([a-zA-Z0-9-_:]+)(?:=["']([^"']*)["']|(?=\s|$))/g;
    let match;
    while ((match = regex.exec(attrStr)) !== null) {
      const name = match[1];
      const val = match[2] !== undefined ? match[2] : true;
      attrs[name] = val;
    }
    return attrs;
  }
}

module.exports = DOMParserHelper;
