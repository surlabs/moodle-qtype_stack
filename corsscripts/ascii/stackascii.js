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

const extractors = { finalfunction };

// Parse answers string in format [ans1,extractor,filter],[ans2,extractor,filter],...
// Returns an array of string entries (one per answer), or false if the format is invalid.
// Mirrors the logic of get_answer_details() in ascii.block.php.
function getAnswerDetails(answers) {
    if (!answers) {
        return false;
    }
    const answervalue = answers.trim();
    const entries = answervalue.split(/\s*\]\s*,\s*\[\s*/);
    const formatvalid = entries.length >= 1
        && entries[0].startsWith('[')
        && entries[entries.length - 1].endsWith(']');
    if (!formatvalid) {
        return false;
    }
    entries[0] = entries[0].slice(1);
    entries[entries.length - 1] = entries[entries.length - 1].slice(0, -1);
    const parsed = entries.map(entry => entry.split(',').map(p => p.trim()));
    for (const parts of parsed) {
        if (parts[0] === '') {
            return false;
        }
    }
    return parsed;
}

export default function init(inputIds, filters, answers) {
    const markdownContainerId = inputIds[0];
    // inputIds[1..N] correspond to each parsed answer entry in order.
    const parsedAnswers = getAnswerDetails(answers);
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

        if (parsedAnswers) {
            parsedAnswers.forEach((entry, i) => {
                const extractor = extractors[entry[1]];
                const answerEl = document.getElementById(inputIds[1 + i]);
                if (extractor && answerEl) {
                    extractor(raw, answerEl);
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
