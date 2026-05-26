import regexall from '../../corsscripts/ascii/extractors/regexall.js';

describe('regexall extractor', () => {

    // ── Guard-clause tests ────────────────────────────────────────────────────

    describe('guard clauses', () => {
        test('returns undefined when operation is undefined', () => {
            expect(regexall('any raw', null, undefined)).toBe('ERROR');
        });

        test('returns undefined when operation is null', () => {
            expect(regexall('any raw', null, null)).toBe('ERROR');
        });

        test('returns undefined when operation.regex is missing', () => {
            expect(regexall('any raw', null, {})).toBe('ERROR');
        });

        test('returns undefined when operation.regex is an empty string (falsy)', () => {
            expect(regexall('any raw', null, { regex: '' })).toBe('ERROR');
        });
    });

    // ── Matching tests ────────────────────────────────────────────────────────

    describe('matching lines', () => {
        test('returns JSON with a single matching line', () => {
            const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
            const result = regexall('f(x) = x^2', null, operation);
            expect(result).toBe(JSON.stringify({ matches: ['f(x) = x^2'] }));
        });

        test('returns JSON with all matching lines', () => {
            const raw = 'f(x) = x\ny = 3\nf(x) = x^2';
            const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
            const result = regexall(raw, null, operation);
            expect(result).toBe(JSON.stringify({ matches: ['f(x) = x', 'f(x) = x^2'] }));
        });

        test('trims whitespace from lines before testing the pattern', () => {
            const raw = '  f(x) = x^2  ';
            const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
            const result = regexall(raw, null, operation);
            expect(result).toBe(JSON.stringify({ matches: ['f(x) = x^2'] }));
        });

        test('skips empty lines', () => {
            const raw = '\nf(x) = expr\n\n';
            const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
            const result = regexall(raw, null, operation);
            expect(result).toBe(JSON.stringify({ matches: ['f(x) = expr'] }));
        });

        test('skips whitespace-only lines', () => {
            const raw = '   \nf(x) = expr\n   ';
            const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
            const result = regexall(raw, null, operation);
            expect(result).toBe(JSON.stringify({ matches: ['f(x) = expr'] }));
        });

        test('preserves order of matches as they appear in raw', () => {
            const raw = 'f(x) = a\nf(x) = b\nf(x) = c';
            const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
            const result = regexall(raw, null, operation);
            const parsed = JSON.parse(result);
            expect(parsed.matches).toEqual(['f(x) = a', 'f(x) = b', 'f(x) = c']);
        });
    });

    // ── No-match tests ────────────────────────────────────────────────────────

    describe('no matching lines', () => {
        test('returns ERROR when no lines match the pattern', () => {
            const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
            expect(regexall('y = x\na = 1', null, operation)).toBe('ERROR');
        });

        test('returns ERROR for an entirely empty raw string', () => {
            const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
            expect(regexall('', null, operation)).toBe('ERROR');
        });

        test('returns ERROR when raw contains only empty lines', () => {
            const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
            expect(regexall('\n\n\n', null, operation)).toBe('ERROR');
        });
    });

    // ── Regex variant tests ───────────────────────────────────────────────────

    describe('arbitrary regex patterns', () => {
        test('works with a simple word-match pattern', () => {
            const operation = { regex: 'hello' };
            const result = regexall('hello world\ngoodbye', null, operation);
            expect(result).toBe(JSON.stringify({ matches: ['hello world'] }));
        });

        test('works with a numeric pattern', () => {
            const operation = { regex: '^\\d+$' };
            const raw = '42\nabc\n7';
            const result = regexall(raw, null, operation);
            expect(result).toBe(JSON.stringify({ matches: ['42', '7'] }));
        });
    });
});
