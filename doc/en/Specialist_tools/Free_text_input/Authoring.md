# Authoring a free-text input question

This page works through the design of the template in 

    samplequestions/stacklibrary/Templates/Free-text_with_equiv_answer.xml 

This links the end of a free-text input question to an equivalence reasoning input.  This question is _not_ manually graded, rather the last block of mathematics is sent to the equivalence reasoning input and automatically assessed.  The rest of the text is ignored.

## Set up question text with two inputs.

This question needs two inputs

`ans1`: A freetext input, to hold the student's text answer (`ans1`)

1. Validation not shown
2. Box size:80 (nice and wide to hold typed text)
3. Extra options: `monospace:true, manualgraded:false`

`ans2`: An equiv input, to hold the last block of mathematics (`ans2`).

1. Validation shown
2. Input textarea hidden by HTML.
3. Insert assuming single-character variables, implied and for spaces.

This question needs an `ascii` block linking `ans1` to `ans2`.

The complete (html) question text is therefore

```
<p> Solve {@eqn1@}.<p>
<p>Work line by line below, justifying your answer fully. </p>
<p>[[input:ans1]] [[validation:ans1]]</p>
[[ascii input="ans1" answer="ans2"]][[/ascii]]
<p style="display:none">[[input:ans2]]</p>
<p>[[validation:ans2]]</p>
[[hint title="Input help"]][[commonstring key="free_text_fact"/]][[/hint]]
```

Note the `hint` block, using a `commonstring` block to provide standard help to students for this input type.

See the question template for values of the question variables.

## Set up the PRT

The basic template just checks the final answer of the student's input currently.
