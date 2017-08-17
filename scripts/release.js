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
    console.log('Bumping up version number...');
    execSync('npm version ' + answer.semver, execOptions);
    var version = require(path.join(__dirname, '..', 'package.json')).version;
    console.log('New version is: ' + version);

    // Step 2. Cut a new build
    console.log('Building new release bundle...');
    execSync('npm run build', execOptions);
    console.log('New release bundle is built!');

    // Step 3. Git push the changes for package.json and release bundle
    console.log('Push new changes...');
    var message = 'Release ' + version;
    execSync('git commit -am "' + message + '"');
    execSync('git push');

    // Step 4. Tag the new version
    console.log('Tag new version ' + version);
    execSync('git tag ' + version);
    execSync('git push origin ' + version);
    console.log('Publishing to npm...');

    // Step 5. NPM publish
    execSync('npm publish');
    console.log('Done');
  });
