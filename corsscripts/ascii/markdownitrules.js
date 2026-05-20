// Markdown-it plugin intended to be used in the browser only – it doesn't have all the Browserify cruft,
// but follows the same browser conventions.

// Extend renderer rules to map source lines
window.markdownitrules = function(mdit, options) {
    "use strict";
    class FilterHandler {
        // Must be applied after latexwrap (use filters: "latexwrap,boldfilter").
        boldfilter(lines) {
            // lines[0] = '\[\begin{align*}', lines[-1] = '\end{align*}\]'
            // latexwrap appends \\ (the LaTeX row-break) directly onto the last content
            // column (e.g. "after\\"), so splitting on & gives ["", " ", " before", "after\\"].
            // We must strip the trailing \\ before wrapping in \boldsymbol, then restore it,
            // otherwise \boldsymbol{after\\} swallows the row-break and output collapses to
            // a single line.
            const rowBreak = '\\\\'; // two actual backslash chars = LaTeX \\
            return lines.map((line, i) => {
                if (i === 0 || i === lines.length - 1) return line;
                return line.split('&').map(col => {
                    let trimmed = col.trim();
                    if (trimmed === '') return col;
                    // Strip trailing \\ so it is never inside \boldsymbol{}.
                    let trailingBreak = '';
                    if (trimmed.endsWith(rowBreak)) {
                        trailingBreak = rowBreak;
                        trimmed = trimmed.slice(0, -rowBreak.length).trim();
                    }
                    if (trimmed === '') return col; // column was only \\
                    // \displaystyle is a math-mode declaration and must stay outside \boldsymbol.
                    const displayPrefix = '\\displaystyle';
                    let bold;
                    if (trimmed.startsWith(displayPrefix)) {
                        const rest = trimmed.slice(displayPrefix.length).trim();
                        bold = rest ? `${displayPrefix}\\boldsymbol{${rest}}` : displayPrefix;
                    } else {
                        bold = `\\boldsymbol{${trimmed}}`;
                    }
                    return bold + trailingBreak;
                }).join('&');
            });
        }

        // The goal of this function is to take the LaTeX string of a line in align* environment and split it up.
        // 1. If we _start_ with an implies, therefore, etc.  then we have this in column to the left.
        // 2. If we have an =, <= etc. which is _outside any kind of bracket_ then we align on this.
        // 3. The first \text{} (which is not a special \text{or} etc) should be a separate column to the right.
        latexwrap(lines) {
            const output = [`\\[\\begin{align*}`];
            for (let str of lines) {
                // 3. Find first occurance of \text{ and bump that to the next column.}
                const matchtxt = this.findtextindex(str, ['\\text{'], [`\\text{or}`, `\\text{and}`, `\\text{if}`]);
                if (matchtxt) {
                    str = str.slice(0, matchtxt) + '& &' + str.slice(matchtxt)
                }
                // 2. Find first occurance of equals, inequality etc. and bump rest to the next column.}
                const bracest = [`in`, `notin`, `subset`, `subseteq`, `supset`, `supseteq`,
                                `leq`, `lt`, `le`, `geq`, `gt`, `ge`,
                                `preq`, `preqeq`, `succ`, `succeq`,
                                `ne`, `neq`, `approx`, `equiv`, `propto`, `cong`,
                                ];
                const braces = [`=`, `>`, '<'].concat(bracest.flatMap(token => [`\\${token}{`, `\\${token} `]));
                const matcheq = this.findtextindex(str, braces);
                // Zero vs false issue.
                if (matcheq !== false) {
                    str = str.slice(0, matcheq) + '&' + str.slice(matcheq);
                } else {
                    str = str + `&`;
                }
                // 1. If we _start_ with an implies, therefore, etc.
                const imptxt = ['Rightarrow', `Leftarrow`, `Leftrightarrow`, `therefore`, `because`];
                const imptxttk = imptxt.flatMap(token => [`\\${token}{`, `\\${token} `]);
                const matchimp = imptxttk.find(token => str.startsWith(token));
                if (matchimp === undefined) {
                    str = `& & ` + str;
                } else {
                    str = str.slice(0, matchimp.length) + '& &' + str.slice(matchimp.length);
                }
                str += `\\\\`;
                output.push(str);
            }
            output.push(`\\end{align*}\\]`);
            return output;
        };

        // Finds the first occurance of something in needle, which is _outside_ any braces, unless it's in without.
        findtextindex(str, needle, without = []) {
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

                // Only consider "needle", e.g. \text at top level.
                if (braceDepth === 0) {
                    // Starts with one of the needles?
                    const isIncluded = needle.some(
                        token => str.startsWith(token, i)
                    );
                    if (!isIncluded) {
                        continue;
                    }
                    // Check against excluded tokens.
                    const isExcluded = without.some(
                        token => str.startsWith(token, i)
                    );
                    if (!isExcluded) {
                        return i;
                    }
                }
            }
        return false;
        }
    }

    options = options || {};
    const filters = options.filters.split(",").map(function(item) {
        return item.trim();
    });
    const handler = new FilterHandler();

    mdit.renderer.rules.code_inline = function(tokens, idx) {
        const code = tokens[idx].content;
        const latexwrap = (s) => `\\(${s}\\)`;
        return latexwrap(window.AMparseMath(code, true));
    };

    mdit.renderer.rules.asciimath_block = function(tokens, idx) {
        const code = tokens[idx].content;
        return applyFilters(code, true);
    };

    mdit.renderer.rules.math_inline = function(tokens, idx) {
        const code = tokens[idx].content;
        const latexwrap = (s) => `\\(${s}\\)`;
        return latexwrap(code);
    };

    mdit.renderer.rules.math_block = function(tokens, idx) {
        const code = tokens[idx].content;
        return applyFilters(code, false);

    };

    function splitBlock(code) {
        // Split, trim, remove empty lines, parse, wrap, and join.
        return code.split(/\r?\n/)                 // Split by newlines.
                .map(line => line.trim())         // Trim whitespace.
                .filter(line => line !== ""); //Remove empty lines
    }

    function applyFilters(code, isASCIIMaths) {
        let lines = splitBlock(code);
        if (isASCIIMaths) {
            lines = lines.map(line => {
                return window.AMparseMath(line, true);
            });
        }
        for (const filter of filters) {
            lines = handler[filter](lines);
        }
        return lines.join('\n') + '\n';
    }
};