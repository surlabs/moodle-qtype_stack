# Authoring free-text questions with extractors

This page discusses a free-text question with extractors.

This is a complex question which can be loaded from 

    Doc-Examples/Specialist-Tools-Docs/Free-text-input/Free-text_with_extractors.xml

This page contains only notes, and we recommend you load this question.

### Design

This question adds free-text working to a classic STACK question.

* one input, the characteristic polynomial, is extracted automatically from the student's text.
* students still have to fill in the final answer, as would be the case with a classic STACK question.

This combination is a pragmatic middle ground between trying to extract all answers with regex, and having students fill in forms.

### Syntax hint as castext

To pre-fill in the "syntax hint" in the free-text input you need to do two things.

First create a maxima variable as a `castext` string

```
sh1:castext("
`
M = {#args(M)#}
`

-----------

Characteristic polynomial =

-----------
");
```

This contains

1. the matrix in the question, but by using `args(M)` we get AsciiMath form `M = [[8,-6,9],[12,-10,12],[0,0,-1]]` rather than maxima syntax `M = matrix([8,-6,9],[12,-10,12],[0,0,-1])`.  Note how we use castext within Maxima here, and we embed variables with the `{#...#}` form, so they are without LaTeX symbols.
2. the syntax hint contains the prompt for students to ensure the regex has a reasonable target: `Characteristic polynomial = `
3. the input `ans1` has syntax hint as castext `{@sh1@}` which displays the castext without `"`s.

### Extractor

Note the ASCII block has an extractor 

```
[input:ans1]] [[validation:ans1]]</p>
[[ascii input="ans1"]]
  [[extractor type="regexmatch" targetinput="scp" regex="^\s*Characteristic polynomial\s*=\s*`?([^`\r\n]+)`?\s*$" /]]
[[/ascii]]
```

This fills in one of the inputs, `scp` which is the student's characteristic polynomial.  This input has very relaxed stars (basically insert `*`s etc).

This input is not displayed, note

```
<p style="display:none">[[input:scp]]</p>
```
but the validation tag will be visible if students make a syntax error.

### Teacher's answer

The teacher's answer for `ans1` is also written as castext within Maxima, in a very similar style to the syntax hint. 