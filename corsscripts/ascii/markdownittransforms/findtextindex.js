// Return the index of the first token from `needle` found at top level in `str`
// (outside any (), [], {}, \lbrace/\rbrace nesting). Tokens listed in `without`
// are ignored even if they also appear in `needle`. Returns false if no match.
// Example: findtextindex('a = {b = c}', ['=']) returns 2.
// Example with without: findtextindex('a = b', ['='], ['=']) returns false.
export default function findtextindex(str, needle, without = []) {
    let braceDepth = 0;

    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        // Track brace nesting.
        if (ch === '{' || ch === '(' || ch === '[') {
            braceDepth++;
            continue;
        }
        if (str.startsWith('\\lbrace', i)) {
            braceDepth++;
            continue;
        }
        if (ch === '}' || ch === ')' || ch === ']') {
            braceDepth = Math.max(0, braceDepth - 1);
            continue;
        }
        if (str.startsWith('\\rbrace', i)) {
            braceDepth = Math.max(0, braceDepth - 1);
            continue;
        }

        // Only consider needle tokens at top level.
        if (braceDepth === 0) {
            const isIncluded = needle.some(token => str.startsWith(token, i));
            if (!isIncluded) {
                continue;
            }
            const isExcluded = without.some(token => str.startsWith(token, i));
            if (!isExcluded) {
                return i;
            }
        }
    }
    return false;
}
