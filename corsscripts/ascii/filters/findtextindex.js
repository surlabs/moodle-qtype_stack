// Finds the first occurrence of something in needle that is _outside_ any braces,
// unless it also matches something in without.
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
