import regexallremainder from '../../corsscripts/ascii/extractors/regexallremainder.js';

describe('regexallremainder extractor', () => {
    test('returns matched lines with the regex prefix removed', () => {
        const raw = 'f(x) = x\ny = 3\nf(x) = x^2';
        const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
        const result = regexallremainder(raw, null, operation);
        expect(result).toBe(JSON.stringify({ matches: ['x', 'x^2'] }));
    });

    test('returns empty strings when regex consumes whole matching lines', () => {
        const raw = '42\nabc\n99';
        const operation = { regex: '^\\d+$' };
        const result = regexallremainder(raw, null, operation);
        expect(result).toBe(JSON.stringify({ matches: ['', ''] }));
    });

    test('returns ERROR when no lines match', () => {
        const operation = { regex: '^f\\(x\\)\\s*=\\s*' };
        expect(regexallremainder('y = x\na = 1', null, operation)).toBe('ERROR');
    });
});