// Extractor: lastcalc
// Sets answerEl to the raw content of the last calculation block.
export default function lastcalc(raw, answerEl, blocks) {
    if (blocks) {
        for (let i = blocks.length - 1; i >= 0; i--) {
            if (blocks[i].type === 'calculation') {
                answerEl.value = blocks[i].raw;
                answerEl.dispatchEvent(new Event('change'));
                return;
            }
        }
    }
}
