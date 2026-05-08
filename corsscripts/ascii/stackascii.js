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

const previewMarkdownConverter = window.markdownit({ html: true })
	.use(window.markdownitrules)
	.use(window.markdownitSub);

function convertMarkdown(markdown) {
	var html;
	var protectedlatex;
	// Protect the latex backslashes before we render markdown.
	protectedlatex = markdown.replace(/\\([()\[\]])/g, '\\\\$1');

	html = previewMarkdownConverter.render(protectedlatex);
	document.getElementById('asciiContainerRow').innerHTML = html;
	console.log(html);
}