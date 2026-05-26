import lastcalc from '../../corsscripts/ascii/extractors/lastcalc.js';

describe('lastcalc extractor', () => {

    describe('with blocks', () => {
        test('returns trimmed content of a single calculation block', () => {
            const blocks = [{ type: 'calculation', raw: '1 + 1' }];
            expect(lastcalc('', blocks)).toBe('1 + 1');
        });

        test('trims whitespace from the calculation block raw', () => {
            const blocks = [{ type: 'calculation', raw: '  x^2  ' }];
            expect(lastcalc('', blocks)).toBe('x^2');
        });

        test('returns trimmed content of the last calculation block when multiple exist', () => {
            const blocks = [
                { type: 'calculation', raw: 'first calc' },
                { type: 'calculation', raw: 'last calc' }
            ];
            expect(lastcalc('', blocks)).toBe('last calc');
        });

        test('scans bottom-up: last calculation block wins over earlier ones', () => {
            const blocks = [
                { type: 'code_inline', raw: 'irrelevant' },
                { type: 'calculation', raw: 'calc one' },
                { type: 'code_inline', raw: 'also irrelevant' },
                { type: 'calculation', raw: 'calc two' }
            ];
            expect(lastcalc('', blocks)).toBe('calc two');
        });

        test('ignores non-calculation blocks', () => {
            const blocks = [
                { type: 'code_inline', raw: 'not a calc' },
                { type: 'calculation', raw: 'calc one' },
                { type: 'asciimath_block', raw: 'also not a calc' }
            ];
            expect(lastcalc('', blocks)).toBe('calc one');
        });

        test('returns ERROR when blocks array contains no calculation blocks', () => {
            const blocks = [{ type: 'paragraph', raw: 'some text' }];
            expect(lastcalc('', blocks)).toBe('ERROR');
        });

        test('returns ERROR for an empty blocks array', () => {
            expect(lastcalc('', [])).toBe('ERROR');
        });
    });

    describe('without blocks', () => {
        test('returns ERROR when blocks is null', () => {
            expect(lastcalc('anything', null)).toBe('ERROR');
        });

        test('returns ERROR when blocks is undefined', () => {
            expect(lastcalc('anything', undefined)).toBe('ERROR');
        });
    });
});
