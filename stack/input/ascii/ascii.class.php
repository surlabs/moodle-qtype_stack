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

require_once(__DIR__ . '/../../utils.class.php');
require_once(__DIR__ . '/../textarea/textarea.class.php');

/**
 * Input that is a text area. Each line input becomes one element of a list.
 *
 * The value is stored as a string maxima list. For example [1,hello,x + y].
 *
 * @package    qtype_stack
 * @copyright  2012 University of Birmingham
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class stack_ascii_input extends stack_textarea_input {
    // phpcs:ignore moodle.Commenting.MissingDocblock.Function
    public function render(stack_input_state $state, $fieldname, $readonly, $tavalue) {
        // Note that at the moment, $this->boxHeight and $this->boxWidth are only
        // used as minimums. If the current input is bigger, the box is expanded.

        if ($this->errors) {
            return $this->render_error($this->errors);
        }

        $attributes = [
            'name' => $fieldname,
            'id'   => $fieldname,
            'autocapitalize' => 'none',
            'spellcheck'     => 'false',
            'class'     => 'maxima-list',
        ];

        if ($this->is_blank_response($state->contents)) {
            $current = $this->maxima_to_raw_input($this->parameters['syntaxHint']);
            if ($this->parameters['syntaxAttribute'] == '1') {
                $attributes['placeholder'] = $current;
                $current = '';
            }
        } else {
            $current = implode("\n", $state->contents);
        }

        // Sort out size of text area.
        $rows = preg_split('/\n+/u', $current);
        $attributes['rows'] = max(5, count($rows) + 1);

        $boxwidth = $this->parameters['boxWidth'];
        foreach ($rows as $row) {
            $boxwidth = max($boxwidth, strlen($row) + 5);
        }
        $attributes['cols'] = $boxwidth;

        if ($readonly) {
            $attributes['readonly'] = 'readonly';
        }

        // Metadata for JS users.
        $attributes['data-stack-input-type'] = 'ascii';
        if ($this->options->get_option('decimals') === ',') {
            $attributes['data-stack-input-decimal-separator']  = ',';
            $attributes['data-stack-input-list-separator'] = ';';
        } else {
            $attributes['data-stack-input-decimal-separator']  = '.';
            $attributes['data-stack-input-list-separator'] = ',';
        }

        return html_writer::tag('textarea', htmlspecialchars($current, ENT_COMPAT), $attributes);
    }

    protected function validate_contents($contents, $basesecurity, $localoptions) {
        $lastentry = array_pop($contents);
        if (trim($lastentry, '` ') === '') {
            $lastentry = array_pop($contents);
        }
        $contents = [trim($lastentry, '` ')];
        return parent::validate_contents($contents, $basesecurity, $localoptions);
    }

    /**
     * Transforms the student's response input into an array.
     * Most return the same as went in.
     *
     * @param array|string $in
     * @return string
     */
    protected function response_to_contents($response) {
        $contents = [];
        if (array_key_exists($this->name, $response)) {
            $sans = $response[$this->name];
            if (trim($sans) == '' && $this->get_extra_option('allowempty')) {
                return ['EMPTYANSWER'];
            }
            $rowsin = explode("\n", $sans);
            foreach ($rowsin as $key => $row) {
                $cleanrow = trim($row);
                $contents[] = $cleanrow;
            }
        }
        return $contents;
    }

    /**
     * This function constructs the display variable for validation.
     *
     * @param stack_casstring $answer, the complete answer.
     * @return string any error messages describing validation failures. An empty
     *      string if the input is valid - at least according to this test.
     */
    protected function validation_display(
        $answer,
        $lvars,
        $caslines,
        $additionalvars,
        $valid,
        $errors,
        $castextprocessor,
        $inertdisplayform,
        $ilines,
        $notes
    ) {
        $rows = [];
        foreach ($caslines as $index => $cs) {
            $row = [];
            $fb = $cs->get_feedback();
            if ($cs->is_correctly_evaluated() && $fb == '') {
                // The zero element of the array defines the display style: 0 = align center, 1 = red frame.
                // ISS1629 - Use textstyle for compact validation.
                $row[] = [
                    0,
                    '\(' .
                    ($this->get_parameter('showValidation', 1) == 3 ? '\textstyle ' : '\displaystyle ') .
                    $ilines[$index]->get_display() .
                    ' \)',
                    ];
                if ($errors[$index]) {
                    $row[] = [1, stack_maxima_translate($errors[$index])];
                }
            } else {
                // Feedback here is always an error.
                if ($fb !== '') {
                    $errors[] = $fb;
                }
                $valid = false;
                $raw = $this->rawcontents;
                $lastentry = array_pop($raw);
                if (trim($lastentry, '` ') === '') {
                    $lastentry = array_pop($raw);
                }
                $row[] = [0, stack_maxima_format_casstring($lastentry)];
                $row[] = [1, trim(stack_maxima_translate($cs->get_errors()) . ' ' . $fb)];
            }
            $rows[] = $row;
        }

        // Do not use tables for compact validation.
        $display = '';
        if ($this->get_parameter('showValidation', 1) == 3) {
            foreach ($rows as $row) {
                foreach ($row as $cell) {
                    $display .= $cell[1] . ' ';
                }
                $display .= '<br/>';
            }
        } else {
            $display = '<table style="vertical-align: middle;" ' .
                'border="0" cellpadding="2" cellspacing="0" align="center"><tbody>';
            foreach ($rows as $row) {
                $display .= '<tr><td>';
                foreach ($row as $cell) {
                    // Zero element of the array $cell defines the display style: 0 = align center, 1 = red frame.
                    if ($cell[0] == 0) {
                        $display .= html_writer::tag('div', $cell[1], ['align' => 'center']);
                    } else {
                        $display .= html_writer::tag('div', $cell[1], ['class' => 'alert alert-danger stackinputerror']);
                    }
                }
                $display .= '</td></tr>';
            }
            $display .= '</tbody></table>';
        }

        // Return errors = null to delete error messages from the bottom of the input.
        return [$valid, null, $display, $notes];
    }

    /**
     * Return the default values for the options. Using this is optional, in this
     * base class implementation, no default options are set.
     * @return array option => default value.
     */
    public static function get_parameters_defaults() {
        return [
            'mustVerify'         => true,
            'showValidation'     => 1,
            'boxWidth'           => 30,
            'insertStars'        => 0,
            'syntaxHint'         => '',
            'syntaxAttribute'    => 0,
            'forbidWords'        => '',
            'allowWords'         => '',
            'forbidFloats'       => true,
            'lowestTerms'        => true,
            'sameType'           => false,
            'options'            => '',
        ];
    }

}
