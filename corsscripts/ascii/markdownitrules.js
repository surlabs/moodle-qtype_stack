// Markdown-it plugin — bundled into stackascii.bundle.js via stackascii.src.js.
// Edit transform behaviour in markdownittransforms/*.js, then run: npm run build:bundle

import boldfilter from './markdownittransforms/020_boldfilter.js';
import latexwrap from './markdownittransforms/010_latexwrap.js';

// Registry maps the string names used in options.transforms to the actual functions.
// Add new transforms here after creating their file in markdownittransforms/.
const transformRegistry = {
    boldfilter,
    latexwrap,
};

export default function markdownitrules(mdit, options) {
    "use strict";
    options = options || {};
    const transforms = (options.transforms || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    const collector = options.collector || null;

    // Reset the collector at the start of each render pass.
    mdit.core.ruler.push('reset_collector', () => {
        if (collector) {
            collector.blocks = [];
        }
    });

    mdit.renderer.rules.code_inline = function(tokens, idx) {
        const code = tokens[idx].content;
        const inlineWrap = (s) => `\\(${s}\\)`;
        const rendered = inlineWrap(window.AMparseMath(code, true));
        if (collector) {
            collector.blocks.push({ type: 'code_inline', raw: code, rendered });
        }
        return rendered;
    };

    mdit.renderer.rules.asciimath_block = function(tokens, idx) {
        const code = tokens[idx].content;
        const rendered = applyTransforms(code, true);
        if (collector) {
            collector.blocks.push({ type: 'asciimath_block', raw: code, rendered });
        }
        return rendered;
    };

    mdit.renderer.rules.math_inline = function(tokens, idx) {
        const code = tokens[idx].content;
        const inlineWrap = (s) => `\\(${s}\\)`;
        const rendered = inlineWrap(code);
        if (collector) {
            collector.blocks.push({ type: 'math_inline', raw: code, rendered });
        }
        return rendered;
    };

    mdit.renderer.rules.math_block = function(tokens, idx) {
        const code = tokens[idx].content;
        const rendered = applyTransforms(code, false);
        if (collector) {
            collector.blocks.push({ type: 'math_block', raw: code, rendered });
        }
        return rendered;
    };

    function splitBlock(code) {
        return code.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
    }

    function applyTransforms(code, isASCIIMaths) {
        let lines = splitBlock(code);
        if (isASCIIMaths) {
            lines = lines.map(line => window.AMparseMath(line, true));
        }
        for (const transform of transforms) {
            if (!transformRegistry[transform]) {
                throw new Error(`markdownitrules: unknown transform "${transform}"`);
            }
            lines = transformRegistry[transform](lines);
        }
        return lines.join('\n') + '\n';
    }
}
