## ASCII-Extractors

The purpose of "extractors" is to identify parts of the student's text, extract this, and send it to another STACK input for automatic assessment. An extractor is specified with a self-closed `[[extractor]]` child block inside the `[[ascii]]` block. Multiple `[[extractor]]` blocks may be used to link to multiple STACK inputs.

Both client-side regular expressions and post-processing in Maxima have their merits and uses and so we support both options for teachers.

### Extractor block parameters

1. `type` (required): the extractor type. See available types below.
2. `targetinput` (required): the name of the STACK input which receives the extracted value.
3. `regex`: a JavaScript regular expression string. Required for the `regexmatch` and `regexall` types. (Backslashes in the regex need to be escaped with an additional backslash.)

## Last expression/calculation extractors

#### `lastexpr`

Returns the trimmed content of the last inline AsciiMath expression (delimited by backticks), or the last nonempty line of the last multi-line AsciiMath block, in document order. Falls back to the final nonempty line of the raw input.

```
[[extractor type="lastexpr" targetinput="ans2" /]]
```

#### `lastblock`

Returns the raw content of the last inline AsciiMath expression, or the _full content_ of the last multi-line AsciiMath block. This option relies on having a multi-line STACK input such as `equiv` or `textarea` to receive the potential multi-line expression.

```
[[extractor type="lastblock" targetinput="ans2" /]]
```

#### `lastcalc`

Returns the trimmed content of the last `calculation` block (i.e. text enclosed in `@...@`). This needs to come directly after the `calculation` filter.

```
[[extractor type="lastcalc" targetinput="ans2" /]]
```
## Regex extractors

For regular expression extractors, the `regex` parameter is required. 

For example, to extract `<expr>` from a line such as `f(x) = <expr>`:

```
[[extractor type="lastregexremainder" targetinput="ans2" regex="^f\\(x\\)\\s*=\\s*" /]]
```

Note the escaped backslashes: in the `regex` attribute value `\\(` represents the regular expression `\(` which matches a literal `(`.

#### `lastregexmatch`

* Scans the raw answer line by line from the end backwards, matching the given regular expression.
* Returns the whole trimmed line.

#### `lastregexremainder`

* Scans the raw answer line by line from the end backwards, matching the given regular expression.
* Returns the whole trimmed line with the regex removed.

#### `lastregexremainder`

* Scans the raw answer line by line from the end backwards, matching the given regular expression.
* Returns the remainder of the line stripped of backslashes and leading/trailing spaces.

#### `regexallmatch`

* Searches the entire raw input for all lines matching the given regular expression.
* Returns a JSON object `{"matches": [...]}` as a string. The target input should be a string or JSON input. (Choose JSON for better debugging.)

```
[[extractor type="regexallmatch" targetinput="ans2" regex="fruit" /]]
```

If the result is assigned to input `ans2`, you can create a Maxima list of the matched strings with:

For example, if you have a regular expression which matches "fruit" within the student's answer (!), then the expected output will be in the form:

    "{\"matches\":[ \"Apple\", \"Banana\", \"Cherry\"]}";

If this is assigned to input `ans2`, then you can create a Maxima list of the matched strings for use in the PRT with the following in the feedback variables.

    sa1: stackmap_get(stackjson_parse(ans2), "matches");

#### `regexallremainder`

* Searches the entire raw input for all lines matching the given regular expression.
* Returns a JSON object `{"matches": [...]}` as a string. The target input should be a string or JSON input. (Choose JSON for better debugging.)
* The regex itself is removed from the matches.

### Extractor developer notes

Extractors are defined in `corsscripts/ascii/extractors`. (In the future we may add more flexible functionality, linking arbitrary extractors to multiple inputs.)

In the future we may also support a `bespoke` extractor enabling users to write JS code into the extractor block for use in that question directly.  Please contact the developers for ideas of extractor use-cases.
