const mockMarkdown = jest.fn();
const mockCalculation = jest.fn();
const mockFinalfunction = jest.fn();
const mockLastexpr = jest.fn();
const mockLastblock = jest.fn();
const mockLastcalc = jest.fn();
const mockRegexmatch = jest.fn();
const mockRegexall = jest.fn();

jest.mock('../../corsscripts/ascii/filters/markdown.js', () => ({
    __esModule: true,
    default: (...args) => mockMarkdown(...args)
}));

jest.mock('../../corsscripts/ascii/filters/calculation.js', () => ({
    __esModule: true,
    default: (...args) => mockCalculation(...args)
}));

jest.mock('../../corsscripts/ascii/extractors/finalfunction.js', () => ({
    __esModule: true,
    default: (...args) => mockFinalfunction(...args)
}));

jest.mock('../../corsscripts/ascii/extractors/lastexpr.js', () => ({
    __esModule: true,
    default: (...args) => mockLastexpr(...args)
}));

jest.mock('../../corsscripts/ascii/extractors/lastblock.js', () => ({
    __esModule: true,
    default: (...args) => mockLastblock(...args)
}));

jest.mock('../../corsscripts/ascii/extractors/lastcalc.js', () => ({
    __esModule: true,
    default: (...args) => mockLastcalc(...args)
}));

jest.mock('../../corsscripts/ascii/extractors/regexmatch.js', () => ({
    __esModule: true,
    default: (...args) => mockRegexmatch(...args)
}));

jest.mock('../../corsscripts/ascii/extractors/regexall.js', () => ({
    __esModule: true,
    default: (...args) => mockRegexall(...args)
}));

import init from '../../corsscripts/ascii/stackascii.js';

describe('stackascii init', () => {
    function createElement(id, value = '') {
        const listeners = {};
        return {
            id,
            value,
            innerHTML: '',
            listeners,
            addEventListener: jest.fn((eventName, handler) => {
                listeners[eventName] = handler;
            }),
            dispatchEvent: jest.fn()
        };
    }

    function setupEnvironment(inputValue, answerCount = 1) {
        const markdownInput = createElement('markdownInput', inputValue);
        const output = createElement('asciiContainerRow');
        const answers = Array.from({ length: answerCount }, (_, index) => createElement(`answer${index + 1}`));

        const elements = {
            markdownInput,
            asciiContainerRow: output
        };
        for (const answer of answers) {
            elements[answer.id] = answer;
        }

        global.document = {
            getElementById: jest.fn((id) => elements[id] || null)
        };
        global.MathJax = {
            typesetPromise: jest.fn(),
            Hub: { Queue: jest.fn() }
        };
        global.Event = function Event(type) {
            return { type };
        };
        global.setTimeout = jest.fn((callback) => {
            callback();
            return 123;
        });
        global.clearTimeout = jest.fn();

        return { markdownInput, output, answers, elements };
    }

    beforeEach(() => {
        mockMarkdown.mockReset();
        mockCalculation.mockReset();
        mockFinalfunction.mockReset();
        mockLastexpr.mockReset();
        mockLastblock.mockReset();
        mockLastcalc.mockReset();
        mockRegexmatch.mockReset();
        mockRegexall.mockReset();
    });

    afterEach(() => {
        delete global.document;
        delete global.MathJax;
        delete global.Event;
        delete global.setTimeout;
        delete global.clearTimeout;
    });

    test('runs filters and extractors, updates output, and dispatches change', () => {
        const env = setupEnvironment('  alpha  ', 1);

        mockMarkdown.mockImplementation((text, blockCollector, op) => {
            blockCollector.blocks.push({ type: 'markdown', raw: text });
            return `MD:${text}`;
        });
        mockCalculation.mockImplementation((text, blockCollector, op) => {
            blockCollector.blocks.push({ type: 'calculation', raw: text });
            return `CALC:${text}`;
        });
        mockLastexpr.mockImplementation((raw, blocks, op) => `EXTRACT:${raw}:${blocks.map((block) => block.type).join('|')}`);

        const stackJS = { clear_input: jest.fn() };
        const operations = [
            { operation: 'filter', type: 'markdown', reset: 'false', display: 'true' },
            { operation: 'filter', type: 'calculation', reset: 'true'},
            { operation: 'extractor', type: 'unknown' }
        ];

        init(['markdownInput', 'answer1', 'answer2'], operations, stackJS);

        expect(mockMarkdown).toHaveBeenCalledWith('alpha', expect.any(Object), operations[0]);
        expect(mockCalculation).toHaveBeenCalledWith('alpha', expect.any(Object), operations[1]);
        expect(mockLastexpr).toHaveBeenCalledWith('alpha', [
            { type: 'markdown', raw: 'alpha' },
            { type: 'calculation', raw: 'alpha' }
        ], operations[2]);
        expect(env.output.innerHTML).toBe('MD:alpha');
        expect(env.answers[0].value).toBe('EXTRACT:alpha:markdown|calculation');
        expect(env.answers[0].dispatchEvent).toHaveBeenCalledWith({ type: 'change' });
        expect(stackJS.clear_input).not.toHaveBeenCalled();
        expect(global.MathJax.typesetPromise).toHaveBeenCalledWith([env.output]);
    });

    test('runs filters and extractors, updates output, and dispatches change, no reset or display', () => {
        const env = setupEnvironment('  alpha  ', 2);

        mockMarkdown.mockImplementation((text, blockCollector, op) => {
            blockCollector.blocks = [{ type: 'markdown', raw: text }];
            return `MD:${text}`;
        });
        mockCalculation.mockImplementation((text, blockCollector, op) => {
            blockCollector.blocks = [{ type: 'calculation', raw: text }];
            return `CALC:${text}`;
        });
        mockLastexpr.mockImplementation((raw, blocks, op) => `EXTRACT:${raw}:${blocks.map((block) => block.type).join('|')}`);
        mockLastcalc.mockImplementation((raw, blocks, op) => `EXTRACTCALC:${raw}:${blocks.map((block) => block.type).join('|')}`);

        const stackJS = { clear_input: jest.fn() };
        const operations = [
            { operation: 'filter', type: 'markdown' },
            { operation: 'extractor', type: 'lastexpr' },
            { operation: 'filter', type: 'calculation' },
            { operation: 'extractor', type: 'lastcalc' }
        ];

        init(['markdownInput', 'answer1', 'answer2'], operations, stackJS);

        expect(mockMarkdown).toHaveBeenCalledWith('alpha', expect.any(Object), operations[0]);
        expect(mockLastexpr).toHaveBeenCalledWith('alpha', [
            { type: 'markdown', raw: 'alpha' }
        ], operations[1]);
        expect(mockCalculation).toHaveBeenCalledWith('MD:alpha', expect.any(Object), operations[2]);
        expect(mockLastcalc).toHaveBeenCalledWith('alpha', [
            { type: 'calculation', raw: 'MD:alpha' }
        ], operations[3]);
        expect(env.output.innerHTML).toBe('CALC:MD:alpha');
        expect(env.answers[0].value).toBe('EXTRACT:alpha:markdown');
        expect(env.answers[0].dispatchEvent).toHaveBeenCalledWith({ type: 'change' });
        expect(env.answers[1].value).toBe('EXTRACTCALC:alpha:calculation');
        expect(env.answers[1].dispatchEvent).toHaveBeenCalledWith({ type: 'change' });
        expect(stackJS.clear_input).not.toHaveBeenCalled();
        expect(global.MathJax.typesetPromise).toHaveBeenCalledWith([env.output]);
    });

    test('clears the answer input when an extractor returns ERROR', () => {
        const env = setupEnvironment('beta', 1);

        mockFinalfunction.mockReturnValue('ERROR');

        const stackJS = { clear_input: jest.fn() };
        const operations = [{ operation: 'extractor', type: 'finalfunction' }];

        init(['markdownInput', 'answer1'], operations, stackJS);

        expect(mockFinalfunction).toHaveBeenCalledWith('beta', [], operations[0]);
        expect(stackJS.clear_input).toHaveBeenCalledWith('answer1');
        expect(env.answers[0].value).toBe('');
        expect(env.answers[0].dispatchEvent).not.toHaveBeenCalled();
        expect(env.output.innerHTML).toBe('beta');
    });

    test('debounces and rerenders when the input changes', () => {
        const env = setupEnvironment('gamma', 0);

        mockMarkdown.mockImplementation((text) => `MD:${text}`);

        const stackJS = { clear_input: jest.fn() };
        const operations = [{ operation: 'filter', type: 'markdown', reset: 'false', display: 'false' }];

        init(['markdownInput'], operations, stackJS);

        expect(env.markdownInput.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        expect(mockMarkdown).toHaveBeenCalledTimes(1);

        env.markdownInput.listeners.change();

        expect(global.clearTimeout).toHaveBeenCalled();
        expect(global.setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
        expect(mockMarkdown).toHaveBeenCalledTimes(2);
        expect(env.output.innerHTML).toBe('MD:gamma');
    });
});