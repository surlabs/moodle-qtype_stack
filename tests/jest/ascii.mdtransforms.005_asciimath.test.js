import asciimath from '../../corsscripts/ascii/markdownittransforms/005_asciimath.js';

describe('asciimath transform', () => {
    test('leaves latex lines unchanged', () => {
        const lines = ['\\[\\begin{align*}', 'x', '\\end{align*}\\]'];
        expect(asciimath(lines, 'asciimath_block')).toEqual([
            '\\[\\begin{align*}',
            'x',
            '\\end{align*}\\]'
        ]);
    });

    test('non-trivial example', () => {
        const lines = ['oo'];
        expect(asciimath(lines, 'asciimath_block')).toEqual([
            '\\infty',
        ]);
    });

    test('includes logical connectives', () => {
        const lines = [
            '`',
            '     log_3(x+17)-2         = log_3(2x)   "(x>0, x>-17)"',
            '<=>  log_3(x+17)-log_3(2x) = 2',
            '`']
        expect(asciimath(lines, 'asciimath_block')).toEqual([
            '\\infty',
        ]);
    });
});