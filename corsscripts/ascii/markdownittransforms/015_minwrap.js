/**
 * Transform: add minimal LaTeX wrapping.
 *
 * @param {string[]} lines - array of strings.
 * @returns {string[]} array of LaTeX strings.
 */
export default function minwrap(lines, rule) {
    switch (rule) {
        case 'asciimath_block':
        case 'math_block':
            lines.push('\\]');
            lines.unshift('\\[');
            return lines;
        case 'code_inline':
        case 'math_inline':
            return [`\\(${lines[0]}\\)`];
        default:
            return lines;
    }
}
