import calculation from '../../corsscripts/ascii/filters/calculation.js';

describe('calculation filter', () => {
    test('wraps text between @ in double stars', () => {
        expect(calculation('The answer is @x^2 + 1@ here')).toBe('The answer is **x^2 + 1** here');
    });

    test('handles multiple @...@ in one line', () => {
        expect(calculation('A: @x@, B: @y@')).toBe('A: **x**, B: **y**');
    });

    test('ignores @ with no closing @', () => {
        expect(calculation('A: @x, B: @y@')).toBe('A: **x, B: **y@');
    });

    test('matches @ symbols in order and leaves an unpaired trailing @', () => {
        expect(calculation('A: @x B: @y@ and @z@')).toBe('A: **x B: **y** and **z@');
    });

    test('does not match across newlines', () => {
        expect(calculation('A: @x\n@y@')).toBe('A: @x\n**y**');
    });

    test('returns input unchanged if no @...@ present', () => {
        expect(calculation('No special markers')).toBe('No special markers');
    });

    test('populates blockCollector with calculation blocks', () => {
        const collector = { blocks: [] };
        calculation('A: @x@, B: @y@', collector);
        expect(collector.blocks).toEqual([
            { type: 'calculation', raw: 'x', rendered: '**x**' },
            { type: 'calculation', raw: 'y', rendered: '**y**' }
        ]);
    });

    test('clears blockCollector.blocks if provided', () => {
        const collector = { blocks: [{ type: 'old', raw: 'z' }] };
        calculation('A: @x@', collector);
        expect(collector.blocks).toEqual([
            { type: 'calculation', raw: 'x', rendered: '**x**' }
        ]);
    });
});
