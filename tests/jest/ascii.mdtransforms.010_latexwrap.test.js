import latexwrap from '../../corsscripts/ascii/markdownittransforms/010_latexwrap.js';
// TODO These tests essentially define what the function currently does. Is the behaviour correct?
describe('latexwrap transform', () => {
    test('returns only wrappers for empty input', () => {
        expect(latexwrap([])).toEqual([
            '\\[\\begin{align*}',
            '\\end{align*}\\]'
        ]);
    });

    test('wraps a simple relation line into align blocks', () => {
        expect(latexwrap(['x = y'])).toEqual([
            '\\[\\begin{align*}',
            '& & x &= y\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('places leading implication text in the first column', () => {
        expect(latexwrap(['\\Rightarrow x = y'])).toEqual([
            '\\[\\begin{align*}',
            '\\Rightarrow & &x &= y\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('moves \text content into the fourth column when not excluded', () => {
        expect(latexwrap(['a = b \\text{then} c'])).toEqual([
            '\\[\\begin{align*}',
            '& & a &= b & &\\text{then} c\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('does not treat excluded \text tokens as a split point', () => {
        expect(latexwrap(['a = b \\text{or} c'])).toEqual([
            '\\[\\begin{align*}',
            '& & a &= b \\text{or} c\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('adds an ampersand when no relation token is found', () => {
        expect(latexwrap(['plain content'])).toEqual([
            '\\[\\begin{align*}',
            '& & plain content&\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('handles brace-delimited relation tokens only at top level', () => {
        expect(latexwrap(['a = {b > c}'])).toEqual([
            '\\[\\begin{align*}',
            '& & a &= {b > c}\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('handles relation token at index 0', () => {
        expect(latexwrap(['= y'])).toEqual([
            '\\[\\begin{align*}',
            '& & &= y\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('splits at the first top-level relation token when multiple exist', () => {
        expect(latexwrap(['a > b = c'])).toEqual([
            '\\[\\begin{align*}',
            '& & a &> b = c\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('ignores excluded text token and splits at a later non-excluded text token', () => {
        expect(latexwrap(['a = b \\text{or} c \\text{then} d'])).toEqual([
            '\\[\\begin{align*}',
            '& & a &= b \\text{or} c & &\\text{then} d\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('ignores relation tokens inside \\lbrace...\\rbrace and splits at top-level relation', () => {
        expect(latexwrap(['a \\lbrace b = c \\rbrace = d'])).toEqual([
            '\\[\\begin{align*}',
            '& & a \\lbrace b = c \\rbrace &= d\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('handles implication token with brace form', () => {
        expect(latexwrap(['\\Rightarrow{x = y}'])).toEqual([
            '\\[\\begin{align*}',
            '\\Rightarrow{& &x = y}&\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('handles complex multiline content in a single transform call', () => {
        expect(latexwrap([
            '\\Rightarrow x = y',
            'a = {b > c} \\text{then} d',
            'plain content',
            '\\because p \\subseteq q'
        ])).toEqual([
            '\\[\\begin{align*}',
            '\\Rightarrow & &x &= y\\\\',
            '& & a &= {b > c} & &\\text{then} d\\\\',
            '& & plain content&\\\\',
            '\\because & &p &\\subseteq q\\\\',
            '\\end{align*}\\]'
        ]);
    });

    test('returns lines unchanged when any line contains a skip environment', () => {
        const input = ['a = b', '\\begin{align} x &= y \\end{align}'];
        expect(latexwrap(input)).toEqual(input);
    });

    test('returns lines unchanged for starred skip environments', () => {
        const input = ['\\begin{equation*} x = y \\end{equation*}'];
        expect(latexwrap(input)).toEqual(input);
    });

    test('skips wrapping for every environment in the nonest list and its starred variant', () => {
        const envs = [
            'align', 'flalign', 'alignat', 'xalignat', 'xxalignat',
            'gather', 'multline', 'equation', 'split', 'subequations'
        ];
        for (const env of envs) {
            const plain = [`\\begin{${env}} a \\end{${env}}`];
            const starred = [`\\begin{${env}*} a \\end{${env}*}`];
            expect(latexwrap(plain)).toEqual(plain);
            expect(latexwrap(starred)).toEqual(starred);
        }
    });
});