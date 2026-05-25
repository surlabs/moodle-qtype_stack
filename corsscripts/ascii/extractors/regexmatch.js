// Extractor: regexmatch
// [[extractor targetinput="ans2" type="regexmatch" regex="^f\\(x\\)\\s*=\\s*" /]]
// Note the scaped backslashes. Searches for a trimmed line beginning 'f(x) = ' where
// there can be any amount of whitespace around the equals. Returns 'f(x) = expr'.
// Scans blocks (bottom-up) for the last code_inline or asciimath_block line
// matching entry.regex, then sets answerEl.value to the matched string.
export default function regexmatch(raw, answerEl, blocks, entry) {
    if (!entry || !entry.regex) {
        return;
    }
    const pattern = new RegExp(entry.regex);

    if (blocks && blocks.length > 0) {
        for (let i = blocks.length - 1; i >= 0; i--) {
            const block = blocks[i];
            if (block.type === 'code_inline') {
                const trimmed = block.raw.trim();
                if (pattern.test(trimmed)) {
                    answerEl.value = trimmed;
                    answerEl.dispatchEvent(new Event('change'));
                    return;
                }
            }
            if (block.type === 'asciimath_block') {
                const lines = block.raw.split(/\r?\n/);
                for (let j = lines.length - 1; j >= 0; j--) {
                    const trimmed = lines[j].trim();
                    if (pattern.test(trimmed)) {
                        answerEl.value = trimmed;
                        answerEl.dispatchEvent(new Event('change'));
                        return;
                    }
                }
            }
        }
        return;
    }

    // Fallback: raw-text parsing when blocks are unavailable.
    const lines = raw.split('\n');
    lines.reverse();
    for (const line of lines) {
        const trimmed = line.trim();
        if (pattern.test(trimmed)) {
            answerEl.value = trimmed;
            answerEl.dispatchEvent(new Event('change'));
            return;
        }
    }
}
