#!/usr/bin/env node

/**
 * Release Scripts
 */

'use strict';
var execSync = require('child_process').execSync;
var path = require('path');
var inquirer = require('inquirer');

inquirer
  .prompt([
    {
      type: 'list',
      name: 'semver',
      message: 'How do you want to release?',
      choices: ['Patch', 'Minor', 'Major'],
      filter: function(val) {
        return val.toLowerCase();
      },
    },
  ])
  .then(function(answer) {
    var execOptions = { cwd: path.join(__dirname, '..') };
    // Step 1. Bump up version number
    execSync('npm version ' + answer.semver, execOptions);
    // Step 2. Cut a new build
    execSync('npm run build', execOptions);
    // Step 3. Git push
    var pkg = require(path.join(__dirname, '..', 'package.json'));
    var message = 'Release ' + pkg.version;
    execSync('git commit -am "' + message + '"');
    execSync('git push');
    // Step 4. NPM publish
    execSync('npm publish');
  });
