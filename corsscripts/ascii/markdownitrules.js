// Markdown-it plugin — bundled into stackascii.bundle.js via stackascii.src.js.
// Edit filter behaviour in filters/*.js, then run: npm run build:bundle

import boldfilter from './filters/020_boldfilter.js';
import latexwrap from './filters/010_latexwrap.js';

// Registry maps the string names used in options.filters to the actual functions.
// Add new filters here after creating their file in filters/.
const filterRegistry = {
    boldfilter,
    latexwrap,
};

export default function markdownitrules(mdit, options) {
    "use strict";
    options = options || {};
    const filters = (options.filters || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    mdit.renderer.rules.code_inline = function(tokens, idx) {
        const code = tokens[idx].content;
        const inlineWrap = (s) => `\\(${s}\\)`;
        return inlineWrap(window.AMparseMath(code, true));
    };

    mdit.renderer.rules.asciimath_block = function(tokens, idx) {
        const code = tokens[idx].content;
        return applyFilters(code, true);
    };

    mdit.renderer.rules.math_inline = function(tokens, idx) {
        const code = tokens[idx].content;
        const inlineWrap = (s) => `\\(${s}\\)`;
        return inlineWrap(code);
    };

    mdit.renderer.rules.math_block = function(tokens, idx) {
        const code = tokens[idx].content;
        return applyFilters(code, false);
    };

    function splitBlock(code) {
        return code.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
    }

    function applyFilters(code, isASCIIMaths) {
        let lines = splitBlock(code);
        if (isASCIIMaths) {
            lines = lines.map(line => window.AMparseMath(line, true));
        }
        for (const filter of filters) {
            if (!filterRegistry[filter]) {
                throw new Error(`markdownitrules: unknown filter "${filter}"`);
            }
            lines = filterRegistry[filter](lines);
        }
        return lines.join('\n') + '\n';
    }
}
