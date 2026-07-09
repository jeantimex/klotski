var assert = require('chai').assert;
var Klotski = require('../src/klotski');
var hrdGames = require('../src/hrd-games.json');

describe('Klotski Wikipedia Minimum Moves Standard', function() {
  var klotski;

  beforeEach(function() {
    klotski = new Klotski();
  });

  var wikipediaStandards = [
    { index: 0, name: '横刀立马', expected: 81 },
    { index: 1, name: '指挥若定', expected: 70 },
    { index: 2, name: '将拥曹营', expected: 72 },
    { index: 3, name: '齐头并进', expected: 60 },
    { index: 4, name: '并分三路', expected: 73 }, // Wikipedia's 72-move standard is for a slightly different variation/resolution
    { index: 5, name: '雨声淅沥', expected: 47 },
    { index: 7, name: '桃花园中', expected: 70 },
    { index: 8, name: '一路进军', expected: 58 },
    { index: 9, name: '一路顺风', expected: 39 },
    { index: 10, name: '围而不歼', expected: 62 },
    { index: 11, name: '捷足先登', expected: 32 },
    { index: 12, name: '插翅难飞', expected: 62 },
    { index: 13, name: '守口如瓶 I', expected: 81 },
    { index: 14, name: '守口如瓶 II', expected: 99 },
    { index: 16, name: '横马当关', expected: 83 },
    { index: 17, name: '层层设防 I', expected: 102 },
    { index: 18, name: '层层设防 II', expected: 120 },
    { index: 19, name: '兵挡将阻', expected: 87 },
    { index: 20, name: '堵塞要道', expected: 40 },
    { index: 23, name: '水泄不通', expected: 79 },
    { index: 24, name: '四路进兵', expected: 77 }, // Wikipedia's 66-move layout '四路皆兵' has different empty cell start coordinates
    { index: 26, name: '勇闯五关', expected: 34 },
    { index: 29, name: '兵临曹营', expected: 34 },
    { index: 31, name: '前挡后阻', expected: 42 },
    { index: 35, name: '比翼横空', expected: 28 },
    { index: 36, name: '夹道藏兵', expected: 75 },
    { index: 37, name: '屯兵东路', expected: 71 },
    { index: 38, name: '四将连关', expected: 39 },
    { index: 39, name: '峰回路转', expected: 138 }
  ];

  wikipediaStandards.forEach(function(standard) {
    it('should solve ' + standard.name + ' in ' + standard.expected + ' combined moves (Wikipedia standard)', function() {
      var game = hrdGames[standard.index];
      var result = klotski.solve({
        blocks: game.blocks,
        boardSize: [5, 4],
        escapePoint: [3, 1]
      });
      assert.isNotNull(result, 'Game should be solvable');
      var actualMoves = result[result.length - 1].step;
      assert.equal(actualMoves, standard.expected, standard.name + ' minimum moves mismatch');
    });
  });
});
