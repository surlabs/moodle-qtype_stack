export default function init(inputIds) {
    const markdownContainerId = inputIds[0];
    const answerContainerId = inputIds[1];

    function renderMath() {
        const raw = document.getElementById(markdownContainerId).value.trim();
        const output = document.getElementById('asciiContainerRow');
        if (!raw) {
            output.innerHTML = '';
            return;
        }

        convertMarkdown(raw);

        // Tell MathJax to typeset only this element
        if (typeof MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise([output]); //MathJax 3
        } else {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'asciiContainerRow']);  //MathJax 2
        }

        let lines = raw.split('\n');
        lines.reverse();
        for (const line of lines) {
            const trimmed = line.trim()
            if (['```', '/]', ''].includes(trimmed)) {
                continue;
            }

            // Convert 'f(x) = answer' to 'answer', removing backticks from beginning and end.
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

// mdItPluginTex.tex must come before markdownitrules.
const previewMarkdownConverter = window.markdownit({ html: true })
    .use(window.markdownitSub)
    .use(window.mdItPluginTex.tex, { render: (content) => content, delimiters: 'brackets' })
    .use(window.asciimathBlock)
    .use(window.markdownitrules);

function convertMarkdown(markdown) {
    const html = previewMarkdownConverter.render(markdown);
    document.getElementById('asciiContainerRow').innerHTML = html;
}