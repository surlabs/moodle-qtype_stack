import regexmatch from '../../corsscripts/ascii/extractors/regexmatch.js';

describe('regexmatch extractor', () => {

    // ── Guard-clause tests ────────────────────────────────────────────────────

    describe('guard clauses', () => {
        test('returns undefined when operation is undefined', () => {
            expect(regexmatch('any raw', [], undefined)).toBe('ERROR');
        });

        test('returns undefined when operation is null', () => {
            expect(regexmatch('any raw', [], null)).toBe('ERROR');
        });

        test('returns undefined when operation.regex is missing', () => {
            expect(regexmatch('any raw', [], {})).toBe('ERROR');
        });

        test('returns undefined when operation.regex is an empty string (falsy)', () => {
            expect(regexmatch('any raw', [], { regex: '' })).toBe('ERROR');
        });
    });

    // ── Block-mode tests ──────────────────────────────────────────────────────

    describe('with blocks', () => {
        const operation = { regex: '^f\\(x\\)\\s*=\\s*' };

        test('returns trimmed raw of a matching code_inline block', () => {
            const blocks = [{ type: 'code_inline', raw: 'f(x) = x^2' }];
            expect(regexmatch('', blocks, operation)).toBe('f(x) = x^2');
        });

        test('trims whitespace from code_inline before matching', () => {
            const blocks = [{ type: 'code_inline', raw: '  f(x) = expr  ' }];
            expect(regexmatch('', blocks, operation)).toBe('f(x) = expr');
        });

        test('returns last matching line from an asciimath_block', () => {
            const blocks = [{
                type: 'asciimath_block',
                raw: 'y = 1\nf(x) = x + 1'
            }];
            expect(regexmatch('', blocks, operation)).toBe('f(x) = x + 1');
        });

        test('scans asciimath_block lines bottom-up for last match', () => {
            const blocks = [{
                type: 'asciimath_block',
                raw: 'f(x) = first\nf(x) = last\nnon-match'
            }];
            expect(regexmatch('', blocks, operation)).toBe('f(x) = last');
        });

        test('scans blocks bottom-up: later block match wins', () => {
            const blocks = [
                { type: 'code_inline', raw: 'f(x) = earlier' },
                { type: 'code_inline', raw: 'f(x) = later' }
            ];
            expect(regexmatch('', blocks, operation)).toBe('f(x) = later');
        });

        test('skips non-matching code_inline and finds earlier match', () => {
            const blocks = [
                { type: 'code_inline', raw: 'f(x) = found' },
                { type: 'code_inline', raw: 'y = x' }
            ];
            expect(regexmatch('', blocks, operation)).toBe('f(x) = found');
        });

        test('ignores blocks that are not code_inline or asciimath_block', () => {
            const blocks = [
                { type: 'paragraph', raw: 'f(x) = ignored' },
                { type: 'code_inline', raw: 'f(x) = found' },
                { type: 'paragraph', raw: 'f(x) = ignored' }
            ];
            expect(regexmatch('', blocks, operation)).toBe('f(x) = found');
        });

        test('returns ERROR when no block matches the pattern', () => {
            const blocks = [
                { type: 'code_inline', raw: 'y = x' },
                { type: 'asciimath_block', raw: 'a = 1\nb = 2' }
            ];
            expect(regexmatch('', blocks, operation)).toBe('ERROR');
        });

        test('handles windows-style line endings in asciimath_block', () => {
            const blocks = [{
                type: 'asciimath_block',
                raw: 'y = 1\r\nf(x) = x^3'
            }];
            expect(regexmatch('', blocks, operation)).toBe('f(x) = x^3');
        });
    });

    // ── Raw-fallback tests ────────────────────────────────────────────────────

    describe('without blocks (raw fallback)', () => {
        const operation = { regex: '^f\\(x\\)\\s*=\\s*' };

        test('returns last matching line from raw', () => {
            expect(regexmatch('f(x) = expr', null, operation)).toBe('f(x) = expr');
        });

        test('scans raw bottom-up and returns last match', () => {
            const raw = 'f(x) = first\nsome text\nf(x) = last';
            expect(regexmatch(raw, null, operation)).toBe('f(x) = last');
        });

        test('trims raw lines before matching', () => {
            expect(regexmatch('  f(x) = trimmed  ', null, operation)).toBe('f(x) = trimmed');
        });

        test('returns ERROR when no raw line matches', () => {
            expect(regexmatch('y = x\na = 1', null, operation)).toBe('ERROR');
        });

        test('returns ERROR for empty raw string', () => {
            expect(regexmatch('', null, operation)).toBe('ERROR');
        });

        test('falls back to raw when blocks is an empty array', () => {
            expect(regexmatch('f(x) = fallback', [], operation)).toBe('f(x) = fallback');
        });
    });

    // ── Arbitrary regex tests ─────────────────────────────────────────────────

    describe('arbitrary regex patterns', () => {
        test('matches a simple word pattern in a code_inline block', () => {
            const blocks = [{ type: 'code_inline', raw: 'hello world' }];
            expect(regexmatch('', blocks, { regex: 'hello' })).toBe('hello world');
        });

        test('matches a numeric pattern in raw fallback', () => {
            const raw = 'abc\n42\n99';
            expect(regexmatch(raw, null, { regex: '^\\d+$' })).toBe('99');
        });
    });
});
