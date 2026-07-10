const Klotski = require('../src/klotski');
const hrdGames = require('../src/hrd-games.json');

const runs = 20;
hrdGames.forEach((game) => {
  let result;
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    const klotski = new Klotski();
    result = klotski.solve({
      blocks: game.blocks,
      boardSize: [5, 4],
      escapePoint: [3, 1]
    });
  }
  const end = performance.now();
  const avgTime = (end - start) / runs;
  const moves = result ? result[result.length - 1].step : '-';
  console.log(`${game.name} | ${moves} | ${avgTime.toFixed(1)} ms`);
});
