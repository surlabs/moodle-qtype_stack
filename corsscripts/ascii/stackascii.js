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

export default function init(inputIds, filters) {
    const markdownContainerId = inputIds[0];
    const answerContainerId = inputIds[1];
    const inputFilters = filters ? filters : 'latexwrap,boldfilter';

    // mdItPluginTex.tex must come before markdownitrules.
    const previewMarkdownConverter = markdownit({ html: true })
        .use(markdownitSub)
        .use(mdItPluginTex.tex, { render: (content) => content, delimiters: 'brackets' })
        .use(asciimathBlock)
        .use(markdownitrules, { filters: inputFilters });

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

        let lines = raw.split('\n');
        lines.reverse();
        for (const line of lines) {
            const trimmed = line.trim();
            if (['```', '/]', ''].includes(trimmed)) {
                continue;
            }

            // Convert 'f(x) = answer' to 'answer', removing backticks.
            if (/^`*f\(x\)\s*=\s*/.test(trimmed)) {
                const answerEl = document.getElementById(answerContainerId);
                answerEl.value = trimmed.replace(/^`*f\(x\)\s*=\s*|`+$/g, '');
                answerEl.dispatchEvent(new Event("change"));
                break;
            }
        }
    }

    let debounceTimer;
    document.getElementById(markdownContainerId).addEventListener('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(renderMath, 100); // debounce 100ms
    });
    renderMath();
}
