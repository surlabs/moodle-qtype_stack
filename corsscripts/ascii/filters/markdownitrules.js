// Markdown-it plugin — bundled into stackascii.bundle.js via stackascii.src.js.
// Edit transform behaviour in markdownittransforms/*.js, then run: npm run build:bundle
// The transformLib is defined in markdown.js and passed via options.state.

export default function markdownitrules(mdit, options) {
    "use strict";
    const state = options.state;

    // Reset the collector at the start of each render pass.
    mdit.core.ruler.push('reset_collector', () => {
        if (state.collector) {
            state.collector.blocks = [];
        }
    });

    mdit.renderer.rules.code_inline = function(tokens, idx) {
        const code = tokens[idx].content;
        const inlineWrap = (s) => `\\(${s}\\)`;
        const rendered = inlineWrap(window.AMparseMath(code, true));
        if (state.collector) {
            state.collector.blocks.push({ type: 'code_inline', raw: code, rendered });
        }
        return rendered;
    };

    mdit.renderer.rules.asciimath_block = function(tokens, idx) {
        const code = tokens[idx].content;
        const rendered = applyTransforms(code, true);
        if (state.collector) {
            state.collector.blocks.push({ type: 'asciimath_block', raw: code, rendered });
        }
        return rendered;
    };

    mdit.renderer.rules.math_inline = function(tokens, idx) {
        const code = tokens[idx].content;
        const inlineWrap = (s) => `\\(${s}\\)`;
        const rendered = inlineWrap(code);
        if (state.collector) {
            state.collector.blocks.push({ type: 'math_inline', raw: code, rendered });
        }
        return rendered;
    };

    mdit.renderer.rules.math_block = function(tokens, idx) {
        const code = tokens[idx].content;
        const rendered = applyTransforms(code, false);
        if (state.collector) {
            state.collector.blocks.push({ type: 'math_block', raw: code, rendered });
        }
        return rendered;
    };

    // Trims lines and removes blank lines before rendering.
    // Should we be removing blank lines here or in transforms?
    function splitBlock(code) {
        return code.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
    }

    function applyTransforms(code, isASCIIMaths) {
        let lines = splitBlock(code);
        if (isASCIIMaths) {
            lines = lines.map(line => window.AMparseMath(line, true));
        }
        for (const transform of state.transforms) {
            if (!state.transformLib[transform]) {
                throw new Error(`markdownitrules: unknown transform "${transform}"`);
            }
            lines = state.transformLib[transform](lines);
        }
        return lines.join('\n') + '\n';
    }
}
