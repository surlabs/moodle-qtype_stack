<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * A command-line script for building maxima-optimised.
 *
 * @package   qtype_stack
 * @copyright 2018 The Open University
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('CLI_SCRIPT', true);

require(__DIR__.'/../../../../config.php');
require_once($CFG->libdir.'/clilib.php');
require_once(__DIR__ . '/../stack/cas/connectorhelper.class.php');
require_once(__DIR__ . '/../stack/cas/connector.dbcache.class.php');
require_once(__DIR__ . '/../stack/cas/installhelper.class.php');

// Now get cli options.
list($options, $unrecognized) = cli_get_params(['help' => false],
    ['h' => 'help']);

if ($unrecognized) {
    $unrecognized = implode("\n  ", $unrecognized);
    cli_error(get_string('cliunknowoption', 'admin', $unrecognized));
}

if ($options['help']) {
    $help =
        "Auto-generate a maxima_opt_auto in the moodledata/stack directory.

        Options:
        -h, --help            Print out this help

        Example:
        \$sudo -u www-data /usr/bin/php question/type/stack/stack/cli/build_maxima_optimised.php
        ";

    echo $help;
    die;
}

cli_heading('Trying to generate maxima_opt_auto');

list($ok, $message) = stack_cas_configuration::create_auto_maxima_image();

if ($ok) {
    cli_heading("DONE.");
    cli_write($message . "\n");
} else {
    cli_error($message);
}

exit(0);
