# klotski (华容道)

A fast JavaScript engine for solving klotski games.

[![npm version](https://badge.fury.io/js/klotski.svg)](https://badge.fury.io/js/klotski)
[![Build Status](https://travis-ci.org/jeantimex/klotski.svg?branch=master)](https://travis-ci.org/jeantimex/klotski)
[![Coverage Status](https://coveralls.io/repos/github/jeantimex/klotski/badge.svg?branch=master)](https://coveralls.io/github/jeantimex/klotski?branch=master)
[![dependencies Status](https://david-dm.org/jeantimex/klotski/status.svg)](https://david-dm.org/jeantimex/klotski)
[![devDependencies Status](https://david-dm.org/jeantimex/klotski/dev-status.svg)](https://david-dm.org/jeantimex/klotski?type=dev)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=BFXQGY77CV3T2)

![cover](docs/images/cover-min.png)

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
var game = {
  blocks: [
    { "shape": [2, 2], "position": [0, 1] },
    { "shape": [2, 1], "position": [0, 0] },
    { "shape": [2, 1], "position": [0, 3] },
    { "shape": [2, 1], "position": [2, 0] },
    { "shape": [2, 1], "position": [2, 3] },
    { "shape": [1, 2], "position": [2, 1] },
    { "shape": [1, 1], "position": [3, 1] },
    { "shape": [1, 1], "position": [3, 2] },
    { "shape": [1, 1], "position": [4, 0] },
    { "shape": [1, 1], "position": [4, 3] },
  ],
  boardSize: [5, 4],
  escapePoint: [3, 1],
};

var result = klotski.solve(game);
```
The first block is the `blocks` list is always the one that tries to escape. 

The `shape` property defines the shape of the block, for example, `[1, 2]` means a horizontal block has 1 row and 2 columns, `[3, 1]` means a vertical block that has 3 rows and 1 column.

`position: [x, y]` is the initial position of the block, it uses zero-based numering.

`boardSize: [number of rows, number of columns]` is the size of the game board.

`escapePoint: [x, y]` is the destination point for block 0 to escape, it uses zero-based numering.

Each block's movement can also be restricted, for example `{ "shape": [2, 1], "position": [0, 0], directions: [0, 2] }`, this will only allow the block to move up and down. The directions code is as follows:
```
down: 0
right: 1
up: 2
left: 3
```

## Algorithm

### Breadth-first search (BFS)

BFS is an algorithm for traversing or searching tree or graph data structures. It starts at the tree root and explores the neighbor nodes first, before moving to the next level neighbors. Basically, we start from the initial game state, try to move every block and generate the new game states, scan each new game state and see if the 2x2 block is at the desired position, if not, we will continue to try. During the try, any duplicate state should be avoided. 

<p align="center">
  <img src="docs/images/bfs.png" />
</p>
<p align="center">Breadth-first search in Klotski</p>

### Zobrist hashing

There are many different ways to represent the current state of the game. We can concatenate each block's position and type to form a string, or we can use the feature of JavaScript Number datatype to optimize the storage space, see this [article](http://simonsays-tw.com/web/Klotski/Klotski.html). The problem is it takes `O(n²)` time to compute the state, and it's really expensive, is there a better way?

We can use Zobrist hashing, according to [Wikipedia](https://en.wikipedia.org/wiki/Zobrist_hashing), _"Zobrist hashing is a hash function construction used in computer programs that play abstract board games, such as chess and Go, to implement transposition tables, a special kind of hash table that is indexed by a board position and used to avoid analyzing the same position more than once."_ Based on the current game state, if a block's position is changed, it only takes `O(1)` time to compute the next state, this is a huge win, and it is the key to boost the performance of the algorithm. See the `getZobristHashUpdate()` function in [klotski.js](src/klotski.js).

Another important factor to improve the algorithm is to avoid the mirror states. For example, the following two states are mirror states:

<p align="center">
  <img src="docs/images/32.png" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/images/32-mirror.png" />
</p>

with Zobrist hashing, we can calculate the mirror state in `O(1)` time, see `getMirrorZobristHash()` function in [klotski.js](src/klotski.js).

At last, in order to use Zobrist hashing, we have to initialize the hashing table. Basically we need to generate a random number for each possible state inside a single cell of the board. A normal Klotski game has 20 cells (5 rows x 4 columns), and each cell can be empty or occupied by 5 different types of blocks. In [klotski.js](src/klotski.js), we use a three-dimensional array to store the initial random numbers, see `initZobristHash()` function for more details.

### Dijkstra's Algorithm & Bucket Queue (for Combined Moves)

In Klotski, moves are usually evaluated as **combined moves** (where moving the same block continuously in one or more steps counts as $1$ move). This represents a shortest path problem with non-uniform edge weights ($0$ and $1$):
* Moving a **different** block has a cost of $1$.
* Continuing to move the **same** block has a cost of $0$.

Under this weight scheme, standard BFS (which assumes uniform edge weights of $1$) does not guarantee the shortest path in terms of combined moves, and standard duplicate pruning (marking a state visited when first reached by BFS) can discard optimal paths.

To solve this, the solver utilizes **Dijkstra's Algorithm** with a **Bucket Queue** (Dial's implementation) to process states in increasing order of combined moves. 

#### State Key Uniqueness
Because the cost of the next transition depends on which block was moved last (continuation vs. new move), the identity of a state in our search space is defined by both the board layout hash and the last moved block index:
$$\text{State Key} = \text{Board Hash} + \text{Last Moved Block Index}$$

We only prune duplicate states if we reach the same configuration with the same last-moved block index and a worse or equal step cost.

## Benchmark

The average running time is calculated by finding the minimum moves of each game 100 times.

| ![1](docs/images/1.png) | ![2](docs/images/2.png) | ![3](docs/images/3.png) | ![4](docs/images/4.png) | ![5](docs/images/5.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 横刀立马 | 指挥若定 | 将拥曹营 | 齐头并进 | 并分三路 |
| 81 moves | 70 moves | 72 moves | 60 moves | 73 moves |
| 145.7 ms | 130.6 ms | 137.8 ms | 136.1 ms | 97.1 ms |

| ![6](docs/images/6.png) | ![7](docs/images/7.png) | ![8](docs/images/8.png) | ![9](docs/images/9.png) | ![10](docs/images/10.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 雨声淅沥 | 左右布兵 | 桃花园中 | 一路进军 | 一路顺风 |
| 47 moves | 54 moves | 70 moves | 58 moves | 39 moves |
| 12.1 ms | 118.3 ms | 131.0 ms | 129.2 ms | 11.8 ms |

| ![11](docs/images/11.png) | ![12](docs/images/12.png) | ![13](docs/images/13.png) | ![14](docs/images/14.png) | ![15](docs/images/15.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 围而不歼 | 捷足先登 | 插翅难飞 | 守口如瓶 I | 守口如瓶 II |
| 62 moves | 32 moves | 62 moves | 81 moves | 99 moves |
| 12.0 ms | 7.0 ms | 263.3 ms | 251.5 ms | 246.5 ms |

| ![16](docs/images/16.png) | ![17](docs/images/17.png) | ![18](docs/images/18.png) | ![19](docs/images/19.png) | ![20](docs/images/20.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 双将挡路 | 横马当关 | 层层设防 I | 层层设防 II | 兵挡将阻 |
| 73 moves | 83 moves | 102 moves | 120 moves | 87 moves |
| 258.6 ms | 242.6 ms | 162.9 ms | 210.0 ms | 206.5 ms |

| ![21](docs/images/21.png) | ![22](docs/images/22.png) | ![23](docs/images/23.png) | ![24](docs/images/24.png) | ![25](docs/images/25.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 堵塞要道 | 瓮中之鳖 | 层峦叠嶂 | 水泄不通 | 四路进兵 |
| 40 moves | 103 moves | 98 moves | 79 moves | 77 moves |
| 99.5 ms | 158.1 ms | 166.2 ms | 102.4 ms | 90.0 ms |

| ![26](docs/images/26.png) | ![27](docs/images/27.png) | ![28](docs/images/28.png) | ![29](docs/images/29.png) | ![30](docs/images/30.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 入地无门 | 勇闯五关 | 四面楚歌 | 前呼后拥 | 兵临曹营 |
| 87 moves | 34 moves | 57 moves | 22 moves | 34 moves |
| 87.3 ms | 10.8 ms | 94.1 ms | 5.5 ms | 7.5 ms |

| ![31](docs/images/31.png) | ![32](docs/images/32.png) | ![33](docs/images/33.png) | ![35](docs/images/35.png) | ![36](docs/images/36.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 五将逼宫 | 前挡后阻 | 近在咫尺 | 小燕出巢 | 比翼横空 |
| 36 moves | 42 moves | 98 moves | 103 moves | 28 moves |
| 39.3 ms | 90.0 ms | 246.2 ms | 159.4 ms | 21.0 ms |

| ![37](docs/images/37.png) | ![38](docs/images/38.png) | ![39](docs/images/39.png) | ![40](docs/images/40.png) | ![34](docs/images/34.png) |
|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|:-----------------------:|
| 夹道藏兵 | 屯兵东路 | 四将连关 | 峰回路转 | 走投无路 |
| 75 moves | 71 moves | 39 moves | 138 moves | no solution |
| 84.1 ms | 113.1 ms | 16.9 ms | 233.4 ms | - |

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
