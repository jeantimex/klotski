var Klotski = require('./klotski');
var games = require('./games.json');

const klotski = new Klotski();
const result = klotski.solve(games[0].heroes);

console.log(result);
