// Extractor: finalfunction
// Scans raw text (bottom-up) for the last line matching f(x) = <expr>,
// then sets answerEl.value to the extracted expression and dispatches a change event.
export default function finalfunction(raw, answerEl) {
    const lines = raw.split('\n');
    lines.reverse();
    for (const line of lines) {
        const trimmed = line.trim();
        if (['```', '/]', ''].includes(trimmed)) {
            continue;
        }

        // Convert 'f(x) = answer' to 'answer', removing backticks.
        if (/^`*f\(x\)\s*=\s*/.test(trimmed)) {
            answerEl.value = trimmed.replace(/^`*f\(x\)\s*=\s*|`+$/g, '');
            answerEl.dispatchEvent(new Event("change"));
            return;
        }
    }
}
