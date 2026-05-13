// Markdown-it plugin intended to be used in the browser only – it doesn't have all the Browserify cruft,
// but follows the same browser conventions.

// Extend renderer rules to map source lines
window.markdownitrules = function(mdit) {
	"use strict";

	mdit.renderer.rules.code_inline = function(tokens, idx) {
		const code = tokens[idx].content;
		const latexwrap = (s) => `\\(${s}\\)`;
		return latexwrap(window.AMparseMath(code, true));
	};

	mdit.renderer.rules.math_inline = function(tokens, idx) {
		const code = tokens[idx].content;
		const latexwrap = (s) => `\\(${s}\\)`;
		return latexwrap(code);
	};

	mdit.renderer.rules.math_block = function(tokens, idx) {
		var code = tokens[idx].content;
		// Split, trim, remove empty lines, parse, wrap, and join.
		const processed = code.split(/\r?\n/)                 // Split by newlines.
							.map(line => line.trim())         // Trim whitespace.
							.filter(line => line !== "")      // Remove empty lines.
							.map(line => latexwrap(line));   // Apply parse and wrap.
		return `\\[\\begin{align*}\n` + processed.join('\n') + `\n\\end{align*}\\]\n`;

	};

    // The goal of this function is to take the LaTeX string of a line in align* environment and split it up.
    // 1. If we _start_ with an implies, therefore, etc.  then we have this in column to the left.
    // 2. If we have an =, <= etc. which is _outside any kind of bracket_ then we align on this.
    // 3. The first \text{} (which is not a special \text{or} etc) should be a separate column to the right.
	function latexwrap(str) {
		// 3. Find first occurance of \text{ and bump that to the next column.}
		const matchtxt = findtextindex(str, ['\\text{'], [`\\text{or}`, `\\text{and}`, `\\text{if}`]);
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
		const matcheq = findtextindex(str, braces);
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
		return str + `\\\\`;
	};

	// Finds the first occurance of something in needle, which is _outside_ any braces, unless it's in without.
	function findtextindex(str, needle, without = []) {
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
};