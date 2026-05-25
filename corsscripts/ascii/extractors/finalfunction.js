// Extractor: finalfunction
// Scans blocks (bottom-up) for the last code_inline or asciimath_block line
// matching f(x) = <expr>, then sets answerEl.value to the extracted expression.
export default function finalfunction(raw, answerEl, blocks) {
    const fxPattern    = /^f\(x\)\s*=\s*/;
    const fxPatternRaw = /^`*f\(x\)\s*=\s*/;

    if (blocks && blocks.length > 0) {
        for (let i = blocks.length - 1; i >= 0; i--) {
            const block = blocks[i];
            if (block.type === 'code_inline') {
                const trimmed = block.raw.trim();
                if (fxPattern.test(trimmed)) {
                    answerEl.value = trimmed.replace(fxPattern, '');
                    answerEl.dispatchEvent(new Event('change'));
                    return;
                }
            }
            if (block.type === 'asciimath_block') {
                const lines = block.raw.split(/\r?\n/);
                for (let j = lines.length - 1; j >= 0; j--) {
                    const trimmed = lines[j].trim();
                    if (fxPattern.test(trimmed)) {
                        answerEl.value = trimmed.replace(fxPattern, '');
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
        if (fxPatternRaw.test(trimmed)) {
            answerEl.value = trimmed.replace(/^`*f\(x\)\s*=\s*|`+$/g, '');
            answerEl.dispatchEvent(new Event('change'));
            return;
        }
    }
}
