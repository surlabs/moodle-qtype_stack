// Markdown filter — creates a single markdownit instance with the full transformLib.
// Call markdown(text, transforms, blockCollector) to render text with a chosen
// subset of transforms. The transformLib is the authoritative registry; add new
// transforms here after creating their file in markdownittransforms/.

import markdownit from '../markdownit.js';
import markdownitSub from '../markdownitextensions/sub.js';
import asciimathBlock from '../markdownitextensions/asciimathblock.js';
import markdownitrules from './markdownitrules.js';

// tex.js uses named CJS exports (exports.tex = ...) — import the whole namespace.
import * as mdItPluginTex from '../markdownitextensions/tex.js';

import boldfilter from '../markdownittransforms/020_boldfilter.js';
import latexwrap from '../markdownittransforms/010_latexwrap.js';

// Registry maps the string names used in the transforms option to the actual functions.
// Add new transforms here after creating their file in markdownittransforms/.
const transformLib = {
    boldfilter,
    latexwrap,
};

// Shared mutable state updated before each render so the single converter instance
// can serve calls with different transforms / collectors.
const state = { transforms: [], transformLib, collector: null };

// mdItPluginTex.tex must come before markdownitrules.
const converter = markdownit({ html: true })
    .use(markdownitSub)
    .use(mdItPluginTex.tex, { render: (content) => content, delimiters: 'brackets' })
    .use(asciimathBlock)
    .use(markdownitrules, { state });

export default function markdown(text, blockCollector, op) {
    state.transforms = (op.transforms || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    state.collector = blockCollector || null;
    return converter.render(text);
}
