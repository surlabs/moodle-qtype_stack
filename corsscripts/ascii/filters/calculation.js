// Filter: calculation - Currently for testing purposes.
// Finds text enclosed in {@...@} on a single line and wraps it in double stars.
// e.g. "The answer is {@x^2 + 1@} here" → "The answer is **x^2 + 1** here"

export default function calculation(text, blockCollector) {
    if (blockCollector) {
        blockCollector.blocks = [];
    }

    return text.replace(/\{@([^\n]+)@\}/g, (match, raw) => {
        const rendered = `**${raw}**`;
        if (blockCollector) {
            blockCollector.blocks.push({ type: 'calculation', raw, rendered });
        }
        return rendered;
    });
}
