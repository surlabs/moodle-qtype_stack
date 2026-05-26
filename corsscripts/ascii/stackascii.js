// Bundle entry point for the full ascii bundle.
// Includes all dependencies so cors.php only needs to serve one file.
// Build with: npm run build
// Output: stackascii.bundle.js

// ASCIIMathTeXImg.js is loaded as a plain <script> tag by the PHP (sloppy mode).
// It sets window.AMparseMath before init() is called.

import markdown from './filters/markdown.js';
import calculation from './filters/calculation.js';

const filterlib = { markdown, calculation };

import finalfunction from './extractors/finalfunction.js';
import lastexpr from './extractors/lastexpr.js';
import lastblock from './extractors/lastblock.js';
import lastcalc from './extractors/lastcalc.js';
import regexmatch from './extractors/regexmatch.js';
import regexall from './extractors/regexall.js';

const extractorlib = { finalfunction, lastexpr, lastblock, lastcalc, regexmatch, regexall };

export default function init(inputIds, operations, stack_js) {
    const stackJS = stack_js;
    const markdownContainerId = inputIds[0];
    // inputIds[1..N] correspond to each parsed answer entry in order.
    const alloperations = operations;
    const filters = operations.filter(operator => operator.operation === 'filter');
    const extractors = operations.filter(operator => operator.operation === 'extractor');
    const blockCollector = { blocks: [] };

    function renderMath() {
        const raw = document.getElementById(markdownContainerId).value.trim();
        const output = document.getElementById('asciiContainerRow');
        if (!raw) {
            output.innerHTML = '';
            return;
        }

        let processedOutput = raw;
        let displayfixed = false;
        let answerIndex = 1;

        if (alloperations) {
            alloperations.forEach((currentop, i) => {
                if (currentop.operation === 'filter') {
                    const filter = filterlib[currentop.type];
                    if (filter) {
                        let filterInput = processedOutput;
                        if (currentop.reset === 'true') {
                            filterInput = raw;
                        }
                        const filterOutput = filter(filterInput, blockCollector, currentop);
                        if (!displayfixed) {
                            processedOutput = filterOutput;
                        }
                        if (currentop.display === 'true') {
                            displayfixed = true;
                        }
                    }
                } else if (currentop.operation === 'extractor') {
                    const extractor = (extractorlib[currentop.type]) ? extractorlib[currentop.type] : extractorlib['lastexpr'];
                    const answerEl = document.getElementById(inputIds[answerIndex]);
                    answerIndex++;
                    if (extractor && answerEl) {
                        let value = extractor(raw, blockCollector.blocks, currentop);
                        if (value === 'ERROR') {
                            stackJS.clear_input(answerEl.id);
                        } else {
                            answerEl.value = value;
                            answerEl.dispatchEvent(new Event('change'));
                        }
                    }
                }
            });
        }

        document.getElementById('asciiContainerRow').innerHTML = processedOutput;

        // Tell MathJax to typeset only this element.
        if (typeof MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise([output]); // MathJax 3
        } else {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'asciiContainerRow']); // MathJax 2
        }
    }

    let debounceTimer;
    document.getElementById(markdownContainerId).addEventListener('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(renderMath, 100); // debounce 100ms
    });
    renderMath();
}
