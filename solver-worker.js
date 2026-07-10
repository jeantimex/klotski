importScripts('./klotski.js');

const solver = new self.Klotski();

self.addEventListener('message', event => {
  const { id, signature, blocks, boardSize, escapePoint } = event.data;

  try {
    const steps = solver.solve({
      blocks: blocks,
      boardSize: boardSize,
      escapePoint: escapePoint,
      singleMove: false,
    });

    if (!steps) {
      self.postMessage({
        id: id,
        signature: signature,
        result: {
          canFinish: false,
          message: 'This game is not solvable. Adjust the blocks before finishing.',
          minMoves: null,
        },
      });
      return;
    }

    const mergedSteps = solver.mergeSteps(steps);
    const minMoves = mergedSteps.length > 0 ? mergedSteps[mergedSteps.length - 1].step : 0;
    self.postMessage({
      id: id,
      signature: signature,
      result: {
        canFinish: true,
        message: '',
        minMoves: minMoves,
      },
    });
  } catch (error) {
    self.postMessage({
      id: id,
      signature: signature,
      result: {
        canFinish: false,
        message: 'Unable to check this layout. Adjust the blocks and try again.',
        minMoves: null,
      },
    });
  }
});
