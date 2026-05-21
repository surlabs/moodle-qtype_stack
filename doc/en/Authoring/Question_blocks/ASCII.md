# ASCII block

This block has two purposes:

1. to process and display the contents of a [free-text input](../Inputs/Text_input.md) using client-side Javascript to process markdown, AsciiMath and LaTeX (etc).
2. to extract information from the text (as it is processed) and link that to another STACK input.

Examples of how to use this block are given in the [free-text specialist tools](../../Specialist_tools/Free_text_input/index.md) documentation.

This example links free-text input `ans1` to another input `ans2`

```
[[ascii input="ans1" answer="ans2"]][[/ascii]]
```

Currently, it is only possible to link to one input.

### Block parameters

Functionality and styling can be customised through the use of block parameters.

1. `input`: string. The name of the free-text input which provides input to this block.
2. `answer`: string. The name of the STACK input which receives an answer from the extractor.
3. `height`: string containing a positive float + a valid CSS unit (e.g.`"480px"`, `"100%"`, ...). Default is to create a window of automatic height to fit all the content upon load. Entering a value for the `height` parameter in the block header fixes the height of the window containing the drag-and-drop lists and will disable automatic resizing of the window containing the lists. Students will still be able to automatically resize the window with the expand button.
4. `width`: string containing a positive float + a valid CSS unit (e.g.`"480px"`, `"100%"`, ...).  Default is `"100%"`. This fixes the width of the window containing the drag-and-drop lists.
5. `aspect-ratio`: string, containing a float between 0 and 1. This can be used with `height`/`length` _or_ `width` (not both) and automatically determines the value of the un-used parameter in accordance with the value of `aspect-ratio`; unset by default. An error will occur if one sets values for `aspect-ratio`, `width`, `height` _or_ `aspect-ratio`, `width`, `length`.
6. `hidden`: To hide the display the contents use the block option `hidden="true"`.


## Filters

To use optional filters, use the block option `filters="latexwrap"`.

The `latexwrap` formats multiple-line mathematics aligned on the first `=` sign, or similar operators such as inequality.

Takes an array of LaTeX strings (one per line) and returns an array whose first element is `\[\begin{align*}` and last element is `\end{align*}\]`, with the content lines in between formatted for a 3-column aligned layout:

* col 1 - leading implies/therefore symbol (if present)
* col 2 - left-hand side up to (but not including) the relation symbol
* col 3 - relation symbol and right-hand side

A `\text{…}` that is not `\text{or/and/if}` is pushed into a 4th column.

* The `boldfilter` changes text to bold

### Developer notes

Filters are defined in `corscripts/ascii/filters`.  This has been designed to add flexibility for filtering.

(In the future we may add the option to use the block contents to allow bespoke filtering.)

## Extractors

The purpose of "extractors" is to identify parts of the student's text, extract this and send it to another STACK input for automatic assessment.

Currently, the only option is to extract the _last mathematics_ in the students answer and link this to one input.

(In the future we may add more flexible functionality, linking arbitrary extractors to multiple inputs.)