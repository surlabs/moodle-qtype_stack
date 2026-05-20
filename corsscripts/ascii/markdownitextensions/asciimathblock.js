// Markdown-it block rule plugin intended to be used in the browser only.
//
// Syntax:
//   Opening marker: a single backtick, optionally followed by spaces/tabs, at end of line.
//   Content:        any lines until the closing marker.
//   Closing marker: any line whose first non-whitespace character is a backtick.
//
// A backtick followed by non-whitespace characters is left untouched so that
// code_inline still fires for `inline code`.

// UMD wrapper: works as a plain <script> (sets window.asciimathBlock) and as
// an esbuild-bundled ES module import (exports the function as default).
(function(global, factory) {
    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = factory();
    } else {
        global.asciimathBlock = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {

function asciimathBlock(mdit) {
    "use strict";

    function asciimathBlockRule(state, startLine, endLine, silent) {
        // Position of first non-whitespace character on the opening line.
        const startPos = state.bMarks[startLine] + state.tShift[startLine];
        const lineEnd  = state.eMarks[startLine];

        // Blank lines cannot be opening markers.
        if (state.tShift[startLine] < 0) {
            return false;
        }

        // Must start with exactly one backtick.
        if (state.src.charCodeAt(startPos) !== 0x60 /* ` */) {
            return false;
        }

        // Must NOT be followed by another backtick (avoids matching fenced blocks).
        if (state.src.charCodeAt(startPos + 1) === 0x60 /* ` */) {
            return false;
        }

        // Every character after the backtick must be a space or tab.
        // If anything else is present, this is inline code — leave it alone.
        for (let i = startPos + 1; i < lineEnd; i++) {
            const ch = state.src.charCodeAt(i);
            if (ch !== 0x20 /* space */ && ch !== 0x09 /* tab */) {
                return false;
            }
        }

        // In silent (probe) mode, just confirm we can handle this line.
        if (silent) {
            return true;
        }

        // Scan forward to find the closing line (first non-blank line starting with a backtick).
        let closingLine = -1;
        const contentLines = [];

        for (let line = startLine + 1; line < endLine; line++) {
            if (state.tShift[line] < 0) {
                // Blank line — include as empty content.
                contentLines.push('');
                continue;
            }

            const lPos = state.bMarks[line] + state.tShift[line];
            const lEnd = state.eMarks[line];

            if (state.src.charCodeAt(lPos) === 0x60 /* ` */ && lPos + 1 === lEnd) {
                // Found the closing marker: a single backtick with no other non-whitespace content.
                closingLine = line;
                break;
            }

            contentLines.push(state.src.slice(lPos, state.eMarks[line]));
        }

        // No closing backtick found — do not consume this block.
        if (closingLine === -1) {
            return false;
        }

        // Emit the asciimath_block token.
        const token = state.push('asciimath_block', '', 0);
        token.content = contentLines.join('\n');
        token.map    = [startLine, closingLine + 1];
        token.markup = '`';

        // Advance the parser past the closing line.
        state.line = closingLine + 1;
        return true;
    }

    mdit.block.ruler.before('paragraph', 'asciimath_block', asciimathBlockRule,
        { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
}

return asciimathBlock;

}); // end UMD factory
