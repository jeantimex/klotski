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

| ![16](docs/images/16.png) | ![17](docs/images/17.png) | ![18](docs/images/18.png) | ![19](docs/images/19.png) | ![20](docs/images/20.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 双将挡路 | 横马当关 | 层层设防 I | 层层设防 II | 兵挡将阻 |
| 73 moves | 84 moves | 103 moves | 121 moves | 88 moves |
| 143.6 ms | 138.9 ms | 96.6 ms | 122.2 ms | 119.7 ms |

| ![21](docs/images/21.png) | ![22](docs/images/22.png) | ![23](docs/images/23.png) | ![24](docs/images/24.png) | ![25](docs/images/25.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 堵塞要道 | 瓮中之鳖 | 层峦叠嶂 | 水泄不通 | 四路进兵 |
| 41 moves | 107 moves | 80 moves | 78 moves | 88 moves |
| 35.2 ms | 100.1 ms | 31.2 ms | 41.5 ms | 34.8 ms |

| ![26](docs/images/26.png) | ![27](docs/images/27.png) | ![28](docs/images/28.png) | ![29](docs/images/29.png) | ![30](docs/images/30.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 入地无门 | 勇闯五关 | 四面楚歌 | 前呼后拥 | 兵临曹营 |
| 88 moves | 34 moves | 57 moves | 22 moves | 34 moves |
| 34.8 ms | 3.4 ms | 30.2 ms | 1.7 ms | 3.0 ms |

| ![31](docs/images/31.png) | ![32](docs/images/32.png) | ![33](docs/images/33.png) | ![35](docs/images/35.png) | ![36](docs/images/36.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 五将逼宫 | 前挡后阻 | 近在咫尺 | 小燕出巢 | 比翼横空 |
| 36 moves | 42 moves | 99 moves | 107 moves | 28 moves |
| 11.8 ms | 32.7 ms | 151.9 ms | 103.0 ms | 6.9 ms |

| ![37](docs/images/37.png) | ![38](docs/images/38.png) | ![39](docs/images/39.png) | ![40](docs/images/40.png) | ![34](docs/images/34.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 夹道藏兵 | 屯兵东路 | 四将连关 | 峰回路转 | 走投无路 |
| 78 moves | 73 moves | 40 moves | 140 moves | no solution |
| 34.9 ms | 67.6 ms | 6.6 ms | 141.3 ms | null |

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
