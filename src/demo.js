var Klotski = require('./klotski');
var games = require('./games.json');

var klotski = new Klotski();
var result = klotski.solve(games[0].blocks, {
  useMirror: true,
  boardSize: [5, 4],
  escapePoint: [3, 1],
});

console.log(result);
