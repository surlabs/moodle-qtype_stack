# Using the `calculation` filter with free-text inputs

The free-text input allows students to embed calculations within their answer.  Rather than reaching for a separate calculator, students can request the result of a calculation client-side using Javascript.

This document gives an example question using this feature.  See the [filter calcuations](../../Authoring/Question_blocks/Filter_calculations.md) reference documentation for the various calculation options.

### Question variables

Notice in the teacher's answer `ta1` they use calculations.  Of course, this is simple, but it is just an example.

```
ta1:"The consecutive even numbers are `2n` and `2n+2`.  Their difference is 2
`
2n + (2n+2) = 45*2
4n + 2 = {@45*2@}
n = {@((45*2)-2)/2@}
`
So we want `2n` which is `{@(45*2)-2@}`.";
ta2:45*2-2;
```

### Question text

```
<p>Find the smaller of two consecutive even numbers such that their sum is \(45\) times there difference.</p>
<p>Work line by line below, justifying your answer fully.</p>
<p>[[input:ans1]] [[validation:ans1]]</p>
[[ascii input="ans1"]]
  [[filter type="calculation" /]]
  [[filter type="markdown-math" transforms="aligneq" /]]
  [[extractor targetinput="ans2" type="finalexpression"/]]
[[/ascii]]
<p>Note, you can embed simple mathematical calculations with rather than reaching for an external calculator.</p>
<p style="display:none">[[input:ans2]]</p>
<p>[[validation:ans2]]</p>
```

The `[[filter]]` blocks specifies how the student's input is processed. 

The first `type="calculation"` extracts `{@...@}` as requested calculations and replaces this with the answer.

The second is `type="markdown-math"` which processes the (updated) text as Markdown with AsciiMath support.  This explicit block is needed because the default `markdown-math` filter is only provided when _no filters_ are explicitly defined in the block.  The filter order matters, and here the question author needs to specify that calculation comes before markdown-math.

Lastly, the final expression is sent to a numerical input.

### Inputs

Input `ans1` holds the free-text.

* Change input `ans1` from the algebraic (default) to [free-text](../../Authoring/Inputs/Text_input.md).
* Change the input "Input box size" to 80 or 100, to give more space to type.
* Change "Student must verify" to no, and "Show the validation" to no.
* Extra options: `monospace:true, manualgraded:false`

Input `ans2` holds the final answer.

* Change input `ans2` from the algebraic (default) to numerical.

### PRT

Set up the PRT to compare `ans2` with `ta2`.  Algebraic equivalence is fine in this simple example.

The PRT could be improved to check for common mistakes, and add feedback.

This question can also be loaded from 

    Doc-Examples/Specialist-Tools-Docs/Free-text-input/Free-text_with_calculation.xml
