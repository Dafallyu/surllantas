/**
 * tests/helpers/css-parser.js
 * Lightweight, zero-dependency CSS parser and rule analyzer for E2E tests.
 */
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const STYLES_CSS_PATH = path.join(PROJECT_ROOT, 'web', 'assets', 'css', 'styles.css');

class CSSParserHelper {
  constructor(cssContent) {
    this.css = cssContent || (fs.existsSync(STYLES_CSS_PATH) ? fs.readFileSync(STYLES_CSS_PATH, 'utf-8') : '');
  }

  static fromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return new CSSParserHelper(content);
  }

  static getStylesCSS() {
    return new CSSParserHelper();
  }

  getRawCSS() {
    return this.css;
  }

  findRulesForSelector(selector) {
    // Escapes special characters for regex
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[}\\n\\r])\\s*([^{}]*?${escaped}[^{}]*?)\\s*\\{([^}]*)\\}`, 'g');
    const rules = [];
    let match;
    while ((match = regex.exec(this.css)) !== null) {
      const matchedSelector = match[1].trim();
      const body = match[2].trim();
      const declarations = this._parseDeclarations(body);
      rules.push({ selector: matchedSelector, body, declarations });
    }
    return rules;
  }

  findMediaQuery(queryKeyword) {
    const escaped = queryKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`@media[^{}]*?${escaped}[^{}]*?\\{([\\s\\S]*?)(?:\\}\\s*\\}|$)`, 'gi');
    const matches = [];
    let match;
    while ((match = regex.exec(this.css)) !== null) {
      matches.push(match[0]);
    }
    return matches;
  }

  hasReducedMotionRule(targetSelector, expectedProperty, expectedValue) {
    const mediaBlocks = this.findMediaQuery('prefers-reduced-motion');
    if (mediaBlocks.length === 0) return false;

    for (const block of mediaBlocks) {
      if (block.includes(targetSelector)) {
        if (!expectedProperty) return true;
        const subParser = new CSSParserHelper(block);
        const rules = subParser.findRulesForSelector(targetSelector);
        for (const r of rules) {
          if (r.declarations[expectedProperty]) {
            if (!expectedValue) return true;
            if (r.declarations[expectedProperty].toLowerCase().includes(expectedValue.toLowerCase())) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  findVariableDefinitions(prefix = '--') {
    const regex = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
    const variables = {};
    let match;
    while ((match = regex.exec(this.css)) !== null) {
      const name = match[1].trim();
      const value = match[2].trim();
      if (name.startsWith(prefix)) {
        variables[name] = value;
      }
    }
    return variables;
  }

  _parseDeclarations(body) {
    const decls = {};
    const statements = body.split(';');
    for (const stmt of statements) {
      const colonIdx = stmt.indexOf(':');
      if (colonIdx > 0) {
        const prop = stmt.substring(0, colonIdx).trim();
        const val = stmt.substring(colonIdx + 1).trim();
        if (prop && val) {
          decls[prop] = val;
        }
      }
    }
    return decls;
  }
}

module.exports = CSSParserHelper;
