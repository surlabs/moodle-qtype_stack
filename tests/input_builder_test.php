<?php
// This file is part of Stack - http://stack.maths.ed.ac.uk/
//
// Stack is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Stack is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Stack.  If not, see <http://www.gnu.org/licenses/>.

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->libdir . '/questionlib.php');
require_once(__DIR__ . '/fixtures/test_base.php');

require_once(__DIR__ . '/../stack/input/factory.class.php');

// Unit tests for stack_builder_input.
//
// @copyright  2020 The University of Edinburgh.
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.

/**
 * @group qtype_stack
 */
class stack_builder_input_test extends qtype_stack_testcase {

    public function test_render_blank() {
        $el = stack_input_factory::make('builder', 'ans1', 'x^2');
        $expected = '<div><p class="stackinputnotice">' .
                'Construct your answer in the upper panel by clicking on phrases in the lower panel.  ' .
                'If you click on a phrase by mistake, just click on it again to move it back to the lower panel.  ' .
                "You may not need to use all of the phrases. </p><br/>\n" .
                "<div class=\"builder_used\" id=\"stack1__ans1_used_div\">" .
                "<ol class=\"builder_used\" id=\"stack1__ans1_used_ol\"></ol></div><br/>\n" .
                "<div class=\"builder_unused\" id=\"stack1__ans1_unused_div\">" .
                "<ol class=\"builder_unused\" id=\"stack1__ans1_unused_ol\"></ol></div>\n".
                "<input id=\"stack1__ans1_raw\" name=\"stack1__ans1_raw\" type=\"hidden\" value=\"[]\"></input>\n</div>";
        $this->assertEquals($expected,
                $el->render(new stack_input_state(stack_input::VALID, array(), '', '', '', '', ''),
                        'stack1__ans1', false, null));
    }

    public function test_bad_teacheranswer() {
        $ta = '[1,2,3]';
        $el = stack_input_factory::make('builder', 'ans1', $ta);
        $el->adapt_to_model_answer($ta);
        $expected = '<div class="error"><p>The input has generated the following runtime error which prevents you from answering.'
                . ' Please contact your teacher.</p><p>The model answer field for this input is malformed: <code>[1,2,3]</code>.'
                . '</p></div>';
        $this->assertEquals($expected, $el->render(new stack_input_state(
                stack_input::SCORE, array('2'), '', '', '', '', ''), 'stack1__ans1', false, null));
    }

    public function test_render_basic() {
        $options = new stack_options();

        $ta = '[["n even", "n is even", 1], ["implies", "implies", 2], ["2n even", "2n is even", 3],' .
                '["if any only if", "iff", -1]]';
        $el = stack_input_factory::make('builder', 'ans1', $ta);
        $el->adapt_to_model_answer($ta);
        $expected = '<div><p class="stackinputnotice">' .
                'Construct your answer in the upper panel by clicking on phrases in the lower panel.  ' .
                'If you click on a phrase by mistake, just click on it again to move it back to the lower panel.  ' .
                "You may not need to use all of the phrases. </p><br/>\n" .
                "<div class=\"builder_used\" id=\"stack1__ans1_used_div\">" .
                "<ol class=\"builder_used\" id=\"stack1__ans1_used_ol\"></ol></div><br/>\n" .
                "<div class=\"builder_unused\" id=\"stack1__ans1_unused_div\">" .
                "<ol class=\"builder_unused\" id=\"stack1__ans1_unused_ol\">".
                "<li class=\"builder_phrase\" id=\"stack1__ans1_1\">n is even</li>\n".
                "<li class=\"builder_phrase\" id=\"stack1__ans1_2\">implies</li>\n" .
                "<li class=\"builder_phrase\" id=\"stack1__ans1_3\">2n is even</li>\n" .
                "<li class=\"builder_phrase\" id=\"stack1__ans1_4\">iff</li></ol></div>\n".
                "<input id=\"stack1__ans1_raw\" name=\"stack1__ans1_raw\" type=\"hidden\" value=\"[]\"></input>\n</div>";
        $this->assertEquals($expected,
                $el->render(new stack_input_state(stack_input::VALID, array(), '', '', '', '', ''),
                        'stack1__ans1', false, null));

        $expected = 'A correct answer is as follows: <br/><div>n is even implies 2n is even</div>';
        $this->assertEquals($expected, $el->get_teacher_answer_display(false, false));

        $state = $el->validate_student_response(array('ans1_raw' => '[1,2]'), $options, '1', new stack_cas_security());
        $this->assertEquals(stack_input::SCORE, $state->status);
        $this->assertEquals(array('1', '2'), $state->contents);
        $this->assertEquals('["n even","implies"]', $state->contentsmodified);
    }
}
