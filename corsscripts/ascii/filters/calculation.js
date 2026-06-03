// Filter: calculation - Currently for testing purposes.
// Finds text enclosed in {@...@} on a single line and evaluates the expression.
// e.g. "The answer is {@2^2 + 1@} here" → "The answer is 5 here"
import math from '../mathjs.min.js';
export default function calculation(text, blockCollector) {
    if (blockCollector) {
        blockCollector.blocks = [];
    }

    return text.replace(/\{@([^\n]+?)@\}/g, (match, raw) => {
        let rendered;
        try {
            rendered = String(math.evaluate(raw));
        } catch (error) {
            rendered = raw;
        }
        if (blockCollector) {
            blockCollector.blocks.push({ type: 'calculation', raw, rendered });
        }
        return rendered;
    });
}
