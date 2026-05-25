// Extractor: regexall
// [[extractor targetinput="ans2" type="regexall" regex="^f\\(x\\)\\s*=\\s*" /]]
// Searches the entire raw input for all lines matching entry.regex and returns
// a JSON object of the form {"matches":[...]} set as answerEl.value.
export default function regexall(raw, answerEl, blocks, entry) {
    if (!entry || !entry.regex) {
        return;
    }
    const pattern = new RegExp(entry.regex);
    const matches = [];

    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && pattern.test(trimmed)) {
            matches.push(trimmed);
        }
    }

    answerEl.value = JSON.stringify({ matches });
    answerEl.dispatchEvent(new Event('change'));
}
