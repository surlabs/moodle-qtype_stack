import finalfunction from '../../corsscripts/ascii/extractors/finalfunction.js';

describe('finalfunction extractor', () => {

    // ── Block-mode tests ──────────────────────────────────────────────────────

    describe('with blocks', () => {
        test('returns expression from a matching code_inline block', () => {
            const blocks = [{ type: 'code_inline', raw: 'f(x) = x^2' }];
            expect(finalfunction('', blocks)).toBe('x^2');
        });

        test('strips leading/trailing whitespace from code_inline before matching', () => {
            const blocks = [{ type: 'code_inline', raw: '  f(x) = sin(x)  ' }];
            expect(finalfunction('', blocks)).toBe('sin(x)');
        });

        test('returns last matching line from an asciimath_block', () => {
            const blocks = [{
                type: 'asciimath_block',
                raw: 'y = 3\nf(x) = x + 1'
            }];
            expect(finalfunction('', blocks)).toBe('x + 1');
        });

        test('scans asciimath_block lines bottom-up and returns last match', () => {
            const blocks = [{
                type: 'asciimath_block',
                raw: 'f(x) = x\nf(x) = x^2\nsome other line'
            }];
            expect(finalfunction('', blocks)).toBe('x^2');
        });

        test('scans blocks bottom-up, returning last block with a match', () => {
            const blocks = [
                { type: 'code_inline', raw: 'f(x) = first' },
                { type: 'code_inline', raw: 'f(x) = last' }
            ];
            expect(finalfunction('', blocks)).toBe('last');
        });

        test('skips non-matching code_inline blocks and finds earlier match', () => {
            const blocks = [
                { type: 'code_inline', raw: 'f(x) = found' },
                { type: 'code_inline', raw: 'y = x' }
            ];
            expect(finalfunction('', blocks)).toBe('found');
        });

        test('returns ERROR when no block line matches f(x) = pattern', () => {
            const blocks = [
                { type: 'code_inline', raw: 'y = x' },
                { type: 'asciimath_block', raw: 'a = 1\nb = 2' }
            ];
            expect(finalfunction('', blocks)).toBe('ERROR');
        });

        test('ignores blocks that are not code_inline or asciimath_block', () => {
            const blocks = [
                { type: 'paragraph', raw: 'f(x) = ignored' },
                { type: 'code_inline', raw: 'f(x) = found' },
                { type: 'paragraph', raw: 'f(x) = ignored' },
            ];
            expect(finalfunction('', blocks)).toBe('found');
        });

        test('returns ERROR for an empty blocks array (falls back to raw, no match)', () => {
            expect(finalfunction('no match here', [])).toBe('ERROR');
        });

        test('handles windows-style line endings in asciimath_block', () => {
            const blocks = [{
                type: 'asciimath_block',
                raw: 'y = 1\r\nf(x) = x^3'
            }];
            expect(finalfunction('', blocks)).toBe('x^3');
        });
    });

    // ── Raw-fallback tests ────────────────────────────────────────────────────

    describe('without blocks (raw fallback)', () => {
        test('returns expression from a plain raw line', () => {
            expect(finalfunction('f(x) = x + 2', null)).toBe('x + 2');
        });

        test('strips backtick delimiters from raw input', () => {
            expect(finalfunction('`f(x) = x^2`', null)).toBe('x^2');
        });

        test('scans raw lines bottom-up and returns last match', () => {
            const raw = 'f(x) = first\nsome text\nf(x) = last';
            expect(finalfunction(raw, null)).toBe('last');
        });

        test('ignores non-matching lines in raw', () => {
            const raw = 'a = 1\nb = 2\nf(x) = expr\nb = 2';
            expect(finalfunction(raw, null)).toBe('expr');
        });

        test('returns ERROR when no raw line matches', () => {
            expect(finalfunction('a = 1\nb = 2', null)).toBe('ERROR');
        });

        test('returns ERROR for empty raw string with null blocks', () => {
            expect(finalfunction('', null)).toBe('ERROR');
        });
    });
});
