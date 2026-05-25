// Bundle entry point for the full ascii bundle.
// Includes all dependencies so cors.php only needs to serve one file.
// Build with: npm run build
// Output: stackascii.bundle.js

// ASCIIMathTeXImg.js is loaded as a plain <script> tag by the PHP (sloppy mode).
// It sets window.AMparseMath before init() is called.

import markdownit from './markdownit.js';
import markdownitSub from './markdownitextensions/sub.js';
import asciimathBlock from './markdownitextensions/asciimathblock.js';
import markdownitrules from './markdownitrules.js';

// tex.js uses named CJS exports (exports.tex = ...) — import the whole namespace.
import * as mdItPluginTex from './markdownitextensions/tex.js';

import finalfunction from './extractors/finalfunction.js';
import lastexpr from './extractors/lastexpr.js';
import lastblock from './extractors/lastblock.js';
import regexmatch from './extractors/regexmatch.js';
import regexall from './extractors/regexall.js';

const extractorlib = { finalfunction, lastexpr, lastblock, regexmatch, regexall };

export default function init(inputIds, operations) {
    const markdownContainerId = inputIds[0];
    // inputIds[1..N] correspond to each parsed answer entry in order.
    const alloperations = operations;
    const filters = operations.filter(operator => operator.operation === 'filter');
    const extractors = operations.filter(operator => operator.operation === 'extractor');
    const markdownitinfo = filters.find(operator => operator.type === 'markdownit');
    const inputTransforms = markdownitinfo ? markdownitinfo.transforms : 'latexwrap,boldfilter';

    const blockCollector = { blocks: [] };

    // mdItPluginTex.tex must come before markdownitrules.
    const previewMarkdownConverter = markdownit({ html: true })
        .use(markdownitSub)
        .use(mdItPluginTex.tex, { render: (content) => content, delimiters: 'brackets' })
        .use(asciimathBlock)
        .use(markdownitrules, { transforms: inputTransforms, collector: blockCollector });

    function convertMarkdown(markdown) {
        const html = previewMarkdownConverter.render(markdown);
        document.getElementById('asciiContainerRow').innerHTML = html;
    }

    function renderMath() {
        const raw = document.getElementById(markdownContainerId).value.trim();
        const output = document.getElementById('asciiContainerRow');
        if (!raw) {
            output.innerHTML = '';
            return;
        }

        convertMarkdown(raw);

        // Tell MathJax to typeset only this element.
        if (typeof MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise([output]); // MathJax 3
        } else {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'asciiContainerRow']); // MathJax 2
        }

        if (extractors) {
            extractors.forEach((entry, i) => {
                const extractor = (extractorlib[entry.type]) ? extractorlib[entry.type] : extractorlib['lastexpr'];
                const answerEl = document.getElementById(inputIds[1 + i]);
                if (extractor && answerEl) {
                    extractor(raw, answerEl, blockCollector.blocks, entry);
                }
            });
        }
    }

    let debounceTimer;
    document.getElementById(markdownContainerId).addEventListener('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(renderMath, 100); // debounce 100ms
    });
    renderMath();
}
