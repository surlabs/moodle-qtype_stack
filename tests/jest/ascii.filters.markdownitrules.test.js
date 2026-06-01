import markdownitrules from '../../corsscripts/ascii/filters/markdownitrules.js';

describe('markdownitrules filter', () => {
    beforeEach(() => {
        global.window = {
            AMparseMath: jest.fn((content) => content)
        };
    });

    afterEach(() => {
        delete global.window;
    });

    // We'll mock the mdit and options objects to test the plugin registration and rule effects.
    function makeFakeMdit() {
        return {
            core: { ruler: { push: jest.fn() } },
            renderer: { rules: {} },
            block: { ruler: { before: jest.fn() } }
        };
    }

    function setup(stateOverrides = {}) {
        const mdit = makeFakeMdit();
        const state = {
            transforms: [],
            transformLib: {},
            collector: null,
            ...stateOverrides
        };
        markdownitrules(mdit, { state });
        return { mdit, state };
    }

    test('registers reset_collector and renderer rules', () => {
        const mdit = makeFakeMdit();
        const options = { state: { transforms: [], transformLib: {}, collector: null } };
        markdownitrules(mdit, options);
        expect(typeof mdit.renderer.rules.code_inline).toBe('function');
        expect(typeof mdit.renderer.rules.asciimath_block).toBe('function');
        expect(typeof mdit.renderer.rules.math_inline).toBe('function');
        expect(typeof mdit.renderer.rules.math_block).toBe('function');
        expect(mdit.core.ruler.push).toHaveBeenCalledWith('reset_collector', expect.any(Function));
    });

    test('throws on unknown transform', () => {
        const mdit = makeFakeMdit();
        const options = { state: { transforms: ['notfound'], transformLib: {}, collector: null } };
        markdownitrules(mdit, options);
        // Simulate a call to applyTransforms
        const fn = mdit.renderer.rules.asciimath_block;
        expect(() => fn([{ content: 'x' }], 0)).toThrow(/unknown transform/);
    });

    test('reset_collector clears collector blocks', () => {
        const collector = { blocks: [{ type: 'old', raw: 'x' }] };
        const { mdit } = setup({ collector });

        const resetCollector = mdit.core.ruler.push.mock.calls[0][1];
        resetCollector();

        expect(collector.blocks).toEqual([]);
    });

    test('code_inline uses AMparseMath and pushes collector block', () => {
        window.AMparseMath.mockImplementation((content) => `PARSED(${content})`);
        const collector = { blocks: [] };
        const { mdit } = setup({ collector });

        const rendered = mdit.renderer.rules.code_inline([{ content: 'x^2' }], 0);

        expect(window.AMparseMath).toHaveBeenCalledWith('x^2', true);
        expect(rendered).toBe('\\(PARSED(x^2)\\)');
        expect(collector.blocks).toEqual([
            { type: 'code_inline', raw: 'x^2', rendered: '\\(PARSED(x^2)\\)' }
        ]);
    });

    test('asciimath_block applies transforms in order and pushes collector block', () => {
        window.AMparseMath.mockImplementation((content) => `P(${content})`);
        const t1 = jest.fn(lines => lines.map(line => `T1:${line}`));
        const t2 = jest.fn(lines => lines.map(line => `T2:${line}`));
        const collector = { blocks: [] };
        const { mdit } = setup({
            transforms: ['t1', 't2'],
            transformLib: { t1, t2 },
            collector
        });

        const raw = ' a  \n\n  b ';
        const rendered = mdit.renderer.rules.asciimath_block([{ content: raw }], 0);

        expect(window.AMparseMath).toHaveBeenNthCalledWith(1, 'a', true);
        expect(window.AMparseMath).toHaveBeenNthCalledWith(2, 'b', true);
        expect(t1).toHaveBeenCalledWith(['P(a)', 'P(b)']);
        expect(t2).toHaveBeenCalledWith(['T1:P(a)', 'T1:P(b)']);
        expect(rendered).toBe('T2:T1:P(a)\nT2:T1:P(b)\n');
        expect(collector.blocks).toEqual([
            { type: 'asciimath_block', raw, rendered: 'T2:T1:P(a)\nT2:T1:P(b)\n' }
        ]);
    });

    test('math_inline wraps raw content and does not call AMparseMath', () => {
        const collector = { blocks: [] };
        const { mdit } = setup({ collector });

        const rendered = mdit.renderer.rules.math_inline([{ content: 'x + 1' }], 0);

        expect(window.AMparseMath).not.toHaveBeenCalled();
        expect(rendered).toBe('\\(x + 1\\)');
        expect(collector.blocks).toEqual([
            { type: 'math_inline', raw: 'x + 1', rendered: '\\(x + 1\\)' }
        ]);
    });

    test('math_block applies transforms without AMparseMath and pushes collector block', () => {
        const t1 = jest.fn(lines => lines.map(line => line.toUpperCase()));
        const collector = { blocks: [] };
        const { mdit } = setup({
            transforms: ['t1'],
            transformLib: { t1 },
            collector
        });

        const raw = ' a\n\n b ';
        const rendered = mdit.renderer.rules.math_block([{ content: raw }], 0);

        expect(window.AMparseMath).not.toHaveBeenCalled();
        expect(t1).toHaveBeenCalledWith(['a', 'b']);
        expect(rendered).toBe('A\nB\n');
        expect(collector.blocks).toEqual([
            { type: 'math_block', raw, rendered: 'A\nB\n' }
        ]);
    });

    test('splitBlock trims lines and removes blank lines before rendering', () => {
        window.AMparseMath.mockImplementation((content) => `P(${content})`);
        const { mdit } = setup({ transforms: [], transformLib: {} });

        const asciiRaw = '  first  \r\n\r\n   second   \n   ';
        const mathRaw = '  left  \n\n   right   \n';

        const asciiRendered = mdit.renderer.rules.asciimath_block([{ content: asciiRaw }], 0);
        const mathRendered = mdit.renderer.rules.math_block([{ content: mathRaw }], 0);

        expect(window.AMparseMath).toHaveBeenNthCalledWith(1, 'first', true);
        expect(window.AMparseMath).toHaveBeenNthCalledWith(2, 'second', true);
        expect(asciiRendered).toBe('P(first)\nP(second)\n');
        expect(mathRendered).toBe('left\nright\n');
    });

    test('applyTransforms with no content still returns trailing newline', () => {
        const { mdit } = setup({ transforms: [], transformLib: {} });

        const rendered = mdit.renderer.rules.math_block([{ content: '   \n\n  ' }], 0);

        expect(rendered).toBe('\n');
    });

    test('code_inline treats content with a LaTeX control sequence as LaTeX and skips AMparseMath', () => {
        const collector = { blocks: [] };
        const { mdit } = setup({ collector });

        const rendered = mdit.renderer.rules.code_inline([{ content: '\\frac{a}{b}' }], 0);

        expect(window.AMparseMath).not.toHaveBeenCalled();
        expect(rendered).toBe('\\(\\frac{a}{b}\\)');
        expect(collector.blocks).toEqual([
            { type: 'code_inline', raw: '\\frac{a}{b}', rendered: '\\(\\frac{a}{b}\\)' }
        ]);
    });

    test('code_inline treats content with ^{ as LaTeX and skips AMparseMath', () => {
        const { mdit } = setup();

        mdit.renderer.rules.code_inline([{ content: 'x^{2}' }], 0);

        expect(window.AMparseMath).not.toHaveBeenCalled();
    });

    test('asciimath_block wraps LaTeX content in \\[...\\] without calling AMparseMath or applying transforms', () => {
        const t1 = jest.fn(lines => lines);
        const collector = { blocks: [] };
        const { mdit } = setup({
            transforms: ['t1'],
            transformLib: { t1 },
            collector
        });

        const raw = '\\begin{matrix} a & b \\end{matrix}';
        const rendered = mdit.renderer.rules.asciimath_block([{ content: raw }], 0);

        expect(window.AMparseMath).not.toHaveBeenCalled();
        expect(t1).not.toHaveBeenCalled();
        expect(rendered).toBe('\\[\\begin{matrix} a & b \\end{matrix}\\]');
        expect(collector.blocks).toEqual([
            { type: 'asciimath_block', raw, rendered: '\\[\\begin{matrix} a & b \\end{matrix}\\]' }
        ]);
    });
});
