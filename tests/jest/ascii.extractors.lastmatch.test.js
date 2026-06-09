import lastmatch from '../../corsscripts/ascii/extractors/lastmatch.js';

describe('lastmatch extractor', () => {
    test('returns ERROR when there is no match', () => {
        const operation = { match: 'f(x) =' };
        expect(lastmatch('a = 1\nb = 2', null, operation)).toBe('ERROR');
    });

    test('returns suffix of the last matching line', () => {
        const raw = 'f(x) = first\nother\n f(x) = last ';
        const operation = { match: 'f(x) =' };
        expect(lastmatch(raw, null, operation)).toBe('last');
    });

    test('returns basic match', () => {
        const raw = ' f(x) = x^2';
        const operation = { match: 'f(x) =' };
        expect(lastmatch(raw, null, operation)).toBe('x^2');
    });

    test('returns basic match no whitespace', () => {
        const raw = ' f(x) =x^2';
        const operation = { match: 'f(x) =' };
        expect(lastmatch(raw, null, operation)).toBe('x^2');
    });

    test('returns basic match backticks', () => {
        const raw = ' f(x) = `x^2`  ';
        const operation = { match: 'f(x) =' };
        expect(lastmatch(raw, null, operation)).toBe('x^2');
    });

    test('returns basic match backticks internal whitespace', () => {
        const raw = ' f(x) = ` x^2 `  ';
        const operation = { match: 'f(x) =' };
        expect(lastmatch(raw, null, operation)).toBe('x^2');
    });

    test('returns basic match no whitespace', () => {
        const raw = 'f(x)=x^2';
        const operation = { match: 'f(x) =' };
        expect(lastmatch(raw, null, operation)).toBe('x^2');
    });

    test('returns external match backticks internal whitespace', () => {
        const raw = '`f(x)=x^2`';
        const operation = { match: 'f(x)=' };
        expect(lastmatch(raw, null, operation)).toBe('x^2');
    });

    test('returns external match backticks lots of whitespace', () => {
        const raw = '` f(x) =x^2  `';
        const operation = { match: 'f(x) =' };
        expect(lastmatch(raw, null, operation)).toBe('x^2');
    });

    test('fails to match', () => {
        const raw = 'hence `f(x)=x^2`.';
        const operation = { match: 'f(x) =' };
        expect(lastmatch(raw, null, operation)).toBe('ERROR');
    });

    test('returns basic match backticks internal whitespace', () => {
        const raw = ' f(x)= x^2  ';
        const operation = { match: 'f(x)=' };
        expect(lastmatch(raw, null, operation)).toBe('x^2');
    });

    test('returns error because of internal whitespace', () => {
        const raw = ' f(x) = x^2  ';
        const operation = { match: 'f(x)=' };
        expect(lastmatch(raw, null, operation)).toBe('ERROR');
    });

        test('returns last match', () => {
        const raw = ' a=1\n a = 2';
        const operation = { match: 'a =' };
        expect(lastmatch(raw, null, operation)).toBe('2');
    });
});