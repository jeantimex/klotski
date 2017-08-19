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

The latest version is now also always available at https://unpkg.org/pkg/klotski/

```html
<script src="https://unpkg.co/klotski/dist/klotski.min.js"></script>
```

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

## Benchmark

The average running time is calculated by solving each of the game 100 times.

| ![1](docs/images/1.png) | ![2](docs/images/2.png) | ![3](docs/images/3.png) | ![4](docs/images/4.png) | ![5](docs/images/5.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 横刀立马 | 指挥若定 | 将拥曹营 | 齐头并进 | 并分三路 |
| 81 moves | 71 moves | 73 moves | 60 moves | 73 moves |
| 65.7 ms | 63.2 ms | 66.4 ms | 65.4 ms | 46.1 ms |

| ![6](docs/images/6.png) | ![7](docs/images/7.png) | ![8](docs/images/8.png) | ![9](docs/images/9.png) | ![10](docs/images/10.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 雨声淅沥 | 左右布兵 | 桃花园中 | 一路进军 | 一路顺风 |
| 47 moves | 54 moves | 70 moves | 58 moves | 39 moves |
| 5.3 ms | 71.9 ms | 80.6 ms | 74.8 ms | 5.0 ms |

| ![11](docs/images/11.png) | ![12](docs/images/12.png) | ![13](docs/images/13.png) | ![14](docs/images/14.png) | ![15](docs/images/15.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 围而不歼 | 捷足先登 | 插翅难飞 | 守口如瓶 I | 守口如瓶 II |
| 62 moves | 32 moves | 62 moves | 83 moves | 100 moves |
| 4.6 ms | 3.1 ms | 146.8 ms | 145.8 ms | 151.0 ms |

| Game  | Min Steps | Avg. Time (ms) |
| ----- | --------- | -------------- |
| 双将挡路 | 73 | 143.698 |
| 横马当关 | 84 | 138.945 |
| 层层设防 | 103 | 96.621 |
| 层层设防 | 121 | 122.227 |
| 兵挡将阻 | 88 | 119.702 |
| 堵塞要道 | 41 | 35.232 |
| 瓮中之鳖 | 107 | 100.179 |
| 层峦叠嶂 | 100 | 97.571 |
| 水泄不通 | 80 | 31.213 |
| 四路进兵 | 78 | 41.545 |
| 入地无门 | 88 | 34.803 |
| 勇闯五关 | 34 | 3.474 |
| 四面楚歌 | 57 | 30.289 |
| 前呼后拥 | 22 | 1.767 |
| 兵临曹营 | 34 | 3.055 |
| 五将逼宫 | 36 | 11.845 |
| 前挡后阻 | 42 | 32.749 |
| 近在咫尺 | 99 | 151.925 |
| 小燕出巢 | 107 | 103.083 |
| 比翼横空 | 28 | 6.982 |
| 夹道藏兵 | 78 | 34.914 |
| 屯兵东路 | 73 | 67.674 |
| 四将连关 | 40 | 6.669 |
| 峰回路转 | 140 | 141.319 |

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
