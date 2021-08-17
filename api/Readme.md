# Minimal STACK API

The purpose of the files in this directory are to provide a minimal and direct API to STACK questions, without any database support.

This is to prove the functionality of including STACK questions in other interactive websites.

## Installation (part of a working STACK installation)

1. Set up STACK working on Moodle server, so typically your php files on the server will look something like

    $CFG->wwwroot = "/var/www/moodle/question/type/stack";

2. Copy 'api/config.php.dist' to '$CFG->wwwroot. "/config.php"' and edit the file to reflect your (moodle) settings.
3. Point your webserver to '?/question/stype/stack/api/endpoint.html' for a basic interaction.  You will need to supply questions in YAML format for this to be operational.


## Installation (stand alone)

This in the manual install process.

1. Install Maxima and Gnuplot on your server.  (Plots not yet supported).
2. Download 'qtype_stack' onto your webserver.  For example into the directory

    $CFG->wwwroot = "/var/www/api";

3. You must have a data directory into which the webserver can write.  Don't put this in your web directory.

    $CFG->dataroot = "/var/data/api";

4. Create the following temporary directories given in '$CFG->dataroot'.  [TODO: automate this?]

    $CFG->dataroot.'/stack'
    $CFG->dataroot.'/stack/plots'
    $CFG->dataroot.'/stack/logs'
    $CFG->dataroot.'/stack/tmp'

5. Copy 'api/config.php.dist' to '$CFG->wwwroot. "/config.php"' and edit the file to reflect your current settings.
6. Run 'api/install.php' using the command line.  This command compiles a Maxima image with your local settings. You will now need to edit 'config.php' to point to your maxima image.  This varies by lisp version, but it might look like this:

    $CFG->maximacommand = 'timeout --kill-after=10s 10s /usr/lib/clisp-2.49/base/lisp.run -q -M /var/data/api/stack/maxima_opt_auto.mem';

7. Point your webserver to 'api/endpoint.html' for a basic interaction.  You will need to supply questions in YAML format for this to be operational.

## Basic usage

To use the API you need to send data to

    /api/endpoint.php

An example of how to do this is in the file

    /api/minimal.php

A more useful interactive testing script is in

    /api/endpoint.html

