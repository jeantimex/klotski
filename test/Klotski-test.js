var assert = require('chai').assert;
var Klotski = require('../src/klotski');
var games = require('../src/games.json');

describe('Klotski', function() {
  var klotski;

  beforeEach(function() {
    klotski = new Klotski();
  });

  it('should solve the problem', function() {
    var result = klotski.solve(games[0].blocks);
    assert.equal(result[0].step, 81);
    assert.equal(result.length, 118);
  });

  it('should solve the problem with options', function() {
    var result = klotski.solve(games[0].blocks, {
      useMirror: false,
    });
    assert.equal(result[0].step, 81);
    assert.equal(result.length, 118);
  });

  it('should return null when block type is unkonwn', function() {
    var blocks = [
      {
        type: 5,
        position: [0, 1],
      },
    ];
    var result = klotski.solve(blocks);
    assert.equal(result, null);
  });

  it('should support tuple input', function() {
    var blocks = [4, 0, 1, 2, 0, 0, 2, 0, 3, 2, 2, 0, 2, 2, 3, 3, 2, 1, 1, 3, 1, 1, 3, 2, 1, 4, 0, 1, 4, 3];
    var result = klotski.solve(blocks);
    assert.equal(result[0].step, 81);
    assert.equal(result.length, 118);
  });

  it('should return null when tuple is invalid', function() {
    var blocks = [4, 0, 1, 2, 0, 0, 2, 0, 3, 2, 2, 0, 2, 2, 3, 3, 2, 1, 1, 3, 1, 1, 3, 2, 1, 4, 0, 1, 4];
    var result = klotski.solve(blocks);
    assert.equal(result, null);
  });

  it('should return null when input is invalid', function() {
    var result = klotski.solve(null);
    assert.equal(result, null);
  });

  it('should return null when input is empty', function() {
    var result = klotski.solve([]);
    assert.equal(result, null);
  });

  it('should return null when input contains invalid data', function() {
    var result = klotski.solve(['test']);
    assert.equal(result, null);
  });

  it('should not solve the game', function() {
    var result = klotski.solve(games[33].blocks);
    assert.equal(result, null);
  });
});
