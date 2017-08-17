var assert = require('chai').assert;
var Klotski = require('../src/klotski');
var games = require('../src/games.json');

describe('Klotski', function() {
  var klotski;

  beforeEach(function() {
    klotski = new Klotski();
  });

  it('should solve the problem', function() {
    var result = klotski.solve(games[0].heroes);
    assert.equal(result.length, 118);
  });
});
