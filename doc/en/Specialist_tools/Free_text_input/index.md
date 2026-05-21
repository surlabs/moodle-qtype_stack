# Free text input

At it's core, STACK provides input boxes into which students can type algebraic expressions. The "equivalence reasoning" input type extends this, allowing multi-line input but that's also limited to algebraic expressions. What's missing is the facility to type a complete mathematical argument.

The free-text input allows students to type a complete mathematical argument.

1. Students type unicode text. Text-formats give complete transparency over what the student types and are future-proof.
2. Students use markdown for document structure and formatting.
3. Students can include [AsciiMath](https://asciimath.org/)/Space Math for mathematics.
4. Students optionally include LaTeX mathematics environments (using brackets `\(...\)`, leaving `$` for currency).

This can be used with [semi-automatic marking](../../Moodle/Semi-automatic_Marking.md).  Or, (algebraic) expressions can be extracted and used in standard STACK inputs for automatic marking.

### Help for students

Built-in help for students can be provided with either

    [[facts:free_text]]

or

    [[hint title="Input help"]][[commonstring key="free_text_fact"/]][[/hint]]

There is also [documentation for students](../../Students/Free_text.md).
