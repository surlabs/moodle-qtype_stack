# Authoring a free-text input question

This page works through the design of the template in

    samplequestions/stacklibrary/Templates/Free-text_with_equiv_answer.xml

This links the end of a free-text input question to an equivalence reasoning input.  This question is _not_ manually graded, rather the last block of mathematics is sent to the equivalence reasoning input and automatically assessed.  The rest of the text is ignored.

## Set up question text with two inputs.

This question needs two inputs

`ans1`: A freetext input, to hold the student's text answer.

1. Validation not shown
2. Box size: 80 (nice and wide to hold typed text)
3. Extra options: `monospace:true, manualgraded:false`

`ans2`: An equiv input, to hold the last block of mathematics.

1. Validation shown
2. Input textarea hidden by HTML.
3. Insert assuming single-character variables, implied and for spaces.

This question needs an `[[ascii]]` block linking `ans1` to `ans2`. The `[[ascii]]` block takes an optional `[[filter]]` child block that controls how the student's text is processed and displayed, and one or more `[[extractor]]` child blocks that extract parts of the text and send them to other STACK inputs.

The complete (html) question text is therefore

```
<p> Solve {@eqn1@}.<p>
<p>Work line by line below, justifying your answer fully. </p>
<p>[[input:ans1]] [[validation:ans1]]</p>
[[ascii input="ans1"]]
[[filter type="markdown" transforms="latexwrap" /]]
[[extractor type="lastblock" targetinput="ans2" /]]
[[/ascii]]
<p style="display:none">[[input:ans2]]</p>
<p>[[validation:ans2]]</p>
[[hint title="Input help"]][[commonstring key="free_text_fact"/]][[/hint]]
```

The `[[filter]]` block specifies how the student's input is processed. Here `type="markdown"` processes the text as Markdown with AsciiMath support, and `transforms="latexwrap"` aligns multi-line mathematics in an `align*` environment.

The `[[extractor]]` block specifies what to extract and where to send it. Here `type="lastblock"` sends the full content of the last AsciiMath block to `ans2`. See [the ASCII block documentation](../../Authoring/Question_blocks/ASCII.md) for the full list of extractor types.

Note the `[[hint]]` block, using a `[[commonstring]]` block to provide standard help to students for this input type.

See the question template for values of the question variables.

## Set up the PRT

The basic template just checks the final answer of the student's input currently.
