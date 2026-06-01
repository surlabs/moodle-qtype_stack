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

        test('returns the suffix of a matching code_inline block after stripping the matched prefix', () => {
            const blocks = [{ type: 'code_inline', raw: 'f(x) = x^2' }];
            expect(regexmatch('', blocks, operation)).toBe('x^2');
        });

        test('trims whitespace from code_inline before matching', () => {
            const blocks = [{ type: 'code_inline', raw: '  f(x) = expr  ' }];
            expect(regexmatch('', blocks, operation)).toBe('expr');
        });

        test('returns the suffix of the last matching line in an asciimath_block after stripping the matched prefix', () => {
            const blocks = [{
                type: 'asciimath_block',
                raw: 'y = 1\nf(x) = x + 1'
            }];
            expect(regexmatch('', blocks, operation)).toBe('x + 1');
        });

        test('scans asciimath_block lines bottom-up for last match', () => {
            const blocks = [{
                type: 'asciimath_block',
                raw: 'f(x) = first\nf(x) = last\nnon-match'
            }];
            expect(regexmatch('', blocks, operation)).toBe('last');
        });

        test('scans blocks bottom-up: later block match wins', () => {
            const blocks = [
                { type: 'code_inline', raw: 'f(x) = earlier' },
                { type: 'code_inline', raw: 'f(x) = later' }
            ];
            expect(regexmatch('', blocks, operation)).toBe('later');
        });

        test('skips non-matching code_inline and finds earlier match', () => {
            const blocks = [
                { type: 'code_inline', raw: 'f(x) = found' },
                { type: 'code_inline', raw: 'y = x' }
            ];
            expect(regexmatch('', blocks, operation)).toBe('found');
        });

        test('ignores blocks that are not code_inline or asciimath_block', () => {
            const blocks = [
                { type: 'paragraph', raw: 'f(x) = ignored' },
                { type: 'code_inline', raw: 'f(x) = found' },
                { type: 'paragraph', raw: 'f(x) = ignored' }
            ];
            expect(regexmatch('', blocks, operation)).toBe('found');
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
            expect(regexmatch('', blocks, operation)).toBe('x^3');
        });
    });

    // ── Raw-fallback tests ────────────────────────────────────────────────────

    describe('without blocks (raw fallback)', () => {
        const operation = { regex: '^f\\(x\\)\\s*=\\s*' };

        test('returns the suffix after stripping the matched prefix from a raw line', () => {
            expect(regexmatch('f(x) = expr', null, operation)).toBe('expr');
        });

        test('scans raw bottom-up and returns suffix of last match', () => {
            const raw = 'f(x) = first\nsome text\nf(x) = last';
            expect(regexmatch(raw, null, operation)).toBe('last');
        });

        test('trims raw lines before matching', () => {
            expect(regexmatch('  f(x) = trimmed  ', null, operation)).toBe('trimmed');
        });

        test('returns ERROR when no raw line matches', () => {
            expect(regexmatch('y = x\na = 1', null, operation)).toBe('ERROR');
        });

        test('returns ERROR for empty raw string', () => {
            expect(regexmatch('', null, operation)).toBe('ERROR');
        });

        test('falls back to raw when blocks is an empty array', () => {
            expect(regexmatch('f(x) = fallback', [], operation)).toBe('fallback');
        });
    });

    // ── Arbitrary regex tests ─────────────────────────────────────────────────

    describe('arbitrary regex patterns', () => {
        test('strips matched prefix from a code_inline block', () => {
            const blocks = [{ type: 'code_inline', raw: 'hello world' }];
            expect(regexmatch('', blocks, { regex: '^hello\\s*' })).toBe('world');
        });

        test('returns empty string when the entire line is consumed by the regex', () => {
            const raw = 'abc\n42\n99';
            expect(regexmatch(raw, null, { regex: '^\\d+$' })).toBe('');
        });
    });
});
