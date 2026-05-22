// Extractor: lastanswer
// Returns the last `code_inline` content or the last non-empty line of the last
// asciimath_block, whichever appears nearer the end of the input.
export default function lastanswer(raw, answerEl) {
    const lines = raw.split(/\r?\n/);

    let bestValue = null;
    let bestLine  = -1;
    let bestChar  = -1; // char end-index within bestLine; -1 for block-sourced values

    // Pass 1: identify asciimath blocks.
    // Opening marker: a line whose only non-whitespace content is a single ` (not ``).
    // Closing marker: first subsequent non-blank line that starts with `.
    // Collect which lines to skip for the inline-code pass, and track the
    // last non-empty content line of each block.
    const skipLines = new Set();
    let i = 0;
    while (i < lines.length) {
        if (/^`[ \t]*$/.test(lines[i])) {
            skipLines.add(i);
            i++;
            let lastNonEmptyLine = -1;
            let lastNonEmptyText = '';
            while (i < lines.length) {
                const trimmed = lines[i].trim();
                if (trimmed !== '' && trimmed[0] === '`') {
                    // Closing marker.
                    skipLines.add(i);
                    i++;
                    break;
                }
                skipLines.add(i);
                if (trimmed !== '') {
                    lastNonEmptyLine = i;
                    lastNonEmptyText = trimmed;
                }
                i++;
            }
            if (lastNonEmptyLine > bestLine) {
                bestLine  = lastNonEmptyLine;
                bestChar  = -1;
                bestValue = lastNonEmptyText;
            }
        } else {
            i++;
        }
    }

    // Pass 2: find inline code spans on non-block lines.
    // A span is `content` where content contains no backticks.
    for (let li = 0; li < lines.length; li++) {
        if (skipLines.has(li)) {
            continue;
        }
        const re = /`([^`\r\n]+)`/g;
        let match;
        while ((match = re.exec(lines[li])) !== null) {
            const endChar = match.index + match[0].length;
            if (li > bestLine || (li === bestLine && endChar > bestChar)) {
                bestLine  = li;
                bestChar  = endChar;
                bestValue = match[1];
            }
        }
    }

    if (bestValue !== null) {
        answerEl.value = bestValue;
        answerEl.dispatchEvent(new Event('change'));
    }
}
