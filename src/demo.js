var Klotski = require('./klotski');
var hrdGames = require('./hrd-games.json');
var customGames = require('./custom-games.json');

var klotski = new Klotski();
var result = klotski.solve(customGames[0]);

console.log(result);
