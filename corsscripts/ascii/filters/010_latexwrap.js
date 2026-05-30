import findtextindex from './findtextindex.js';

// Takes an array of LaTeX strings (one per line) and returns an array whose first
// element is \[\begin{align*} and last element is \end{align*}\], with the content
// lines in between formatted for a 3-column aligned layout:
//   col 1 – leading implies/therefore symbol (if present)
//   col 2 – left-hand side up to (but not including) the relation symbol
//   col 3 – relation symbol and right-hand side
// A \text{…} that is not \text{or/and/if} is pushed into a 4th column.
export default function latexwrap(lines) {
    // Do not attempt to wrap LaTeX which is already aligned.
    const nonest = [
        'align',
        'flalign',
        'alignat',
        'xalignat',
        'xxalignat',
        'gather',
        'multline',
        'equation',
        'split',
        'subequations'
        ];
    const skipenv = nonest.flatMap(token => [`\\begin{${token}}`, `\\begin{${token}*}`]);
    var skip = false;
    for (let str of lines) {
        if (findtextindex(str, skipenv) !== false) {
            skip = true;
        }
    }
    if (skip) {
        return lines;
    }
    const output = [`\\[\\begin{align*}`];
    for (let str of lines) {
        str = str.trim();
        // 3. Find first occurrence of \text{ and bump that to the next column.
        const matchtxt = findtextindex(str, ['\\text{'], [`\\text{or}`, `\\text{and}`, `\\text{if}`]);
        if (matchtxt) {
            str = str.slice(0, matchtxt) + "& &" + str.slice(matchtxt);
        }
        // 2. Find first occurrence of equals, inequality etc. and bump rest to the next column.
        const bracest = [
            `in`, `notin`, `subset`, `subseteq`, `supset`, `supseteq`,
            `leq`, `lt`, `le`, `geq`, `gt`, `ge`,
            `preq`, `preqeq`, `succ`, `succeq`,
            `ne`, `neq`, `approx`, `equiv`, `propto`, `cong`,
        ];
        const braces = [`=`, `>`, `<`].concat(bracest.flatMap(token => [`\\${token}{`, `\\${token} `]));
        const matcheq = findtextindex(str, braces);
        // Zero vs false issue.
        if (matcheq !== false) {
            str = str.slice(0, matcheq) + "&" + str.slice(matcheq);
        } else {
            str = str + "&";
        }
        // 1. If we _start_ with an implies, therefore, etc. put it in col 1.
        // If we have a "\\displaystyle" at the start then it kills step (1) below.
        str = str.trim();
        var displaystyle = "";
        if (str.startsWith("\\displaystyle")) {
            str = str.slice("\\displaystyle".length);
            displaystyle = "\\displaystyle";
        }
        const imptxt = [`Rightarrow`, `Leftarrow`, `Leftrightarrow`, `therefore`, `because`];
        const imptxttk = imptxt.flatMap(token => [`\\${token}{`, `\\${token} `, `\\${token}\\`]);
        const matchimp = imptxttk.find(token => str.startsWith(token));
        if (matchimp === undefined) {
            str = "& &" + displaystyle + str;
        } else {
            str = str.slice(0, matchimp.length - 1) + "& &" + displaystyle + str.slice(matchimp.length - 1);
        }
        str += `\\\\`;
        output.push(str);
    }
    output.push(`\\end{align*}\\]`);
    return output;
}
