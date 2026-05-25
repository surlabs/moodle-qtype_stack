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
import lastanswer from './extractors/lastanswer.js';

const extractorlib = { finalfunction, lastanswer };

export default function init(inputIds, filters, operatorsjson) {
    const markdownContainerId = inputIds[0];
    // inputIds[1..N] correspond to each parsed answer entry in order.
    const operations = JSON.parse(operatorsjson);
    const extractors = operations.filter(operator => operator.operation === 'extractor');
    const inputFilters = filters ? filters : 'latexwrap,boldfilter';

    const blockCollector = { blocks: [] };

    // mdItPluginTex.tex must come before markdownitrules.
    const previewMarkdownConverter = markdownit({ html: true })
        .use(markdownitSub)
        .use(mdItPluginTex.tex, { render: (content) => content, delimiters: 'brackets' })
        .use(asciimathBlock)
        .use(markdownitrules, { filters: inputFilters, collector: blockCollector });

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
                const extractor = (extractorlib[entry.type]) ? extractorlib[entry.type] : extractorlib['lastanswer'];
                const answerEl = document.getElementById(inputIds[1 + i]);
                if (extractor && answerEl) {
                    extractor(raw, answerEl, blockCollector.blocks);
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
