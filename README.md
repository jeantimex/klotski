# klotski

The JavaScript algorithm for solving klotski game.

[![npm version](https://badge.fury.io/js/klotski.svg)](https://badge.fury.io/js/klotski)
[![Build Status](https://travis-ci.org/jeantimex/klotski.svg?branch=master)](https://travis-ci.org/jeantimex/klotski)
[![Coverage Status](https://coveralls.io/repos/github/jeantimex/klotski/badge.svg?branch=master)](https://coveralls.io/github/jeantimex/klotski?branch=master)

## Installation

### node.js

Install using npm:

```bash
$ npm install klotski
```

### Browser

Using bower:

```bash
$ bower install klotski
```

If you are not using any module loader system then the API will then be accessible via the `window.Klotski` object.

**CDN**

The latest version is now also always available at https://unpkg.co/klotski/dist/klotski.min.js

## Usage

**Default usage**

```javascript
var Klotski = require('klotski');

var klotski = new Klotski();
var heroes = [
  { "type": 2, "position": [0, 0] },
  { "type": 4, "position": [0, 1] },
  { "type": 2, "position": [0, 3] },
  { "type": 2, "position": [2, 0] },
  { "type": 3, "position": [2, 1] },
  { "type": 2, "position": [2, 3] },
  { "type": 1, "position": [4, 0] },
  { "type": 1, "position": [3, 1] },
  { "type": 1, "position": [3, 2] },
  { "type": 1, "position": [4, 3] }
];

var result = klotski.solve(heroes);
```

## Contribution

Anyone who would like to contribute to the project is more than welcome.

* Fork this repo
* Make your changes
* Submit pull request

## License ##

MIT License

Copyright (c) 2017 Yong Su @jeantimex

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
