export default function init(markdownId) {
	let debounceTimer;
	markdownContainerId = markdownId;
	document.getElementById(markdownId).addEventListener('change', () => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(renderMath(), 100); // debounce 100ms
	});
	renderMath();
}

var markdownContainerId = null;

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
}

// mdItPluginTex.tex must come before markdownitrules.
const previewMarkdownConverter = window.markdownit({ html: true })
	.use(window.markdownitSub)
	.use(window.mdItPluginTex.tex, { render: (content) => content, delimiters: 'all' })
	.use(window.markdownitrules);

function convertMarkdown(markdown) {
	const html = previewMarkdownConverter.render(markdown);
	document.getElementById('asciiContainerRow').innerHTML = html;
}