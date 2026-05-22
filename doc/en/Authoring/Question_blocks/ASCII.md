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
6. `hidden`: To hide the display of the contents use the block option `hidden="true"`.


## Filters

To use optional filters, use the block option `filters="latexwrap"`.

The `latexwrap` formats multiple-line mathematics aligned on the first `=` sign, or similar operators such as inequality.

Takes an array of LaTeX strings (one per line) and returns an array whose first element is `\[\begin{align*}` and last element is `\end{align*}\]`, with the content lines in between formatted for a 3-column aligned layout:

* col 1 - leading implies/therefore symbol (if present)
* col 2 - left-hand side up to (but not including) the relation symbol
* col 3 - relation symbol and right-hand side

A `\text{…}` that is not `\text{or/and/if}` is pushed into a 4th column.

* The `boldfilter` changes text to bold.  (This is experimental for testing and development only.)

### Filter developer notes

Filters are defined in `corscripts/ascii/filters`.  This has been designed to add flexibility for filtering.

(In the future we may add the option to use the block contents to allow bespoke filtering.)

(In the future we may add a filter which parses AsciiMath into strict Maxima syntax.)

## Extractors

The purpose of "extractors" is to identify parts of the student's text, extract this, and send it to another STACK input for automatic assessment.

The following are important use-cases.

1. Extract the last mathematical expression and send this to an input.  This is either (i) the last inline AsciiMath delimited by backticks, or (ii) the _last line_ of the last multi-line mathematical expression/derivation.
2. Extract the whole of the last mathematical expression and send this to an input.  This is either (i) the last inline AsciiMath delimited by backticks, or (ii) the _whole_ of the last multi-line mathematical expression/derivation.  This option relies on having a multi-line STACK input such as equiv or textarea to receive the potential multi-line expression.
3. Identify the last mathematical expression (as in 1) and match part of this using a regular expression.  Logically, this is situation (1) with a non-trivial regular expression as a parameter.  The first match is sent to a STACK input.  This could be a Maxima input (e.g. algebraic) or STACK's string input. (See below)
4. Apply a regular expression to the entire text input, and assemble a JSON object with all the matched patterns.  This is not assumed to be mathematics, and so is sent to STACK as a string/JSON object.  This option relies on having a string/JSON input (choose JSON for better debugging). (See below)

### Extract Maxima using regular expressions

Imagine we are expecting a student to conclude with \(f(x) = \) `expr` and we wish to assess their answer `expr` in a PRT automatically.

One way to do this would be to use a regular expression client-side, e.g. the regular expression `^*f\(x\)\s*=\s*` will match this, and we then send only the match to the input.  This approach gives the validation message "Your last answer ..." only including `expr` as validated.

Another way to do this would be to send _everything_ to the input (e.g. `ans1`) and sort out the student's answer in the PRT.  For example you could define

    sa1: if equationp(ans1) then rhs(ans1) else ans1;

in the feebdack variables.  If `ans1` is an equation, this takes the right-hand side of `ans1`, or the whole expression otherwise.  This second approach condones lack of `f(x)=` in a student's answer or them using something else.

Both client-side regular expressions, and post-processing in Maxima, have their merits and uses and so we suppport both options for teachers.

### Extract strings using regular expressions

We may want to match text within the answer using regular expressions.

If you have a regular expressions which matches "fruit" within the student's answer (!), then you would expect the STACK input to contain the Maxima string

    "{\"matches\":[ \"Apple\", \"Bannan\", \"Cherry\"]}";

If this is assigned to input `ans1` then you can create a Maxima list of the matched strings with `sa1: stackmap_get(stackjson_parse(ans1), "matches");` in the PRT.

### Extractor developer notes

(In the future we may add more flexible functionality, linking arbitrary extractors to multiple inputs.)

