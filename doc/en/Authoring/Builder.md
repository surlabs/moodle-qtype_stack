# The builder input type

This is an input that allows the student to build a section of text by selecting phrases in order from a given pool.

Phrases will be a list of lists of two strings. The first string is a phrase that the student can use in their answer, and the second string is a key  used to identify the phrase.  The internal Maxima representation of the student's answer will be a list of these keys.  The keys should consist of characters that do not need to be escaped.

As with [multiple response questions](MCQ.md), the teacher  answer field is not really the teacher answer but  instead is a complete specification of the question. It should consist of a list of triples `[key,text,pos]` where key and text are strings and pos is a natural number.  The text phrases are given in the order in which they should be shown to the student.  The teacher's answer consists of the phrases where `pos > 0`, in the order specified by pos.

For example, we might like to ask students to re-construct the definition of convergence of terms in a sequence \(a_n\) to the limit \(a\), in the form \[ \forall \epsilon > 0 \exists N \in \mathbb{N},  n>N \Rightarrow |a_n-a|<\epsilon \]

We might start by splitting this phrase up into the following format.

    ta0:[["forall", "\\(\\forall\\)", 1], ["epsilon greater than zero", "\\(\\epsilon > 0\\)", 2], 
        ["exists", "\\(\\exists\\)", 3], ["N a natural number", "\\(N \\in \\mathbb{N}\\)", 4], 
        ["n greater than N", "\\(n > N\\)", 5], ["implies", "\\(\\Rightarrow\\)", 6], 
        ["terms are within epsilon of the limit", "\\(|a_n-a|<\\epsilon\\)", 7]];

This creates a correctly formatted "teacher's answer".  Since this list is defined in order, to extract the "list of keys" needed to compare with the student's answer we simply

    ta1:maplist(first,ta0);

Lastly we want to mix up the list so student's are not presented with the list in the correct order.  This could be a random permulation of the list `ta2:random_permutation(ta0)` or `ta2:sort(ta0)`.

Then,

1. Use `ta2` as the teacher answer in a builder input type.
2. Compare the student's answer with `ta1` in the potential response tree.

## Including redundant options

You may include redundant options by putting `pos <= 0`.  These can easily be automatically filtered out using sublist.  In the example below `ta2` is a correctly formatted (and mixed up) teacher answer.  `ta1` can be used in a potential response tree for the purposes of comparison.

    ta0:[["\(n\) even", "n even", 1], ["implies", "\\(\\Rightarrow\\)", 2], ["2n even", "\\(2n\\) is even", 3],  ["if any only if", "\\(\\Leftrightarrow\\)", -1] ];
    ta1:sublist(ta0, lambda([ex], third(ex)>0));
    ta1:maplist(first,ta1);
    ta2:sort(ta0);


## Writing question tests ##

Quality control of questions is important.  See the notes on [testing](Testing.md) questions.

When entering test cases the question author must type in the CAS expression they expect to be returned by the input. That is the list of `key` portions, NOT the `text` field.  For example, in the above example a test case (`tc1`) could be defined as follows.

     tc1:["forall","epsilon greater than zero","exists","N a natural number","n greater than N","implies","terms are within epsilon of the limit"];

Then the system matches up the `key` portions.
