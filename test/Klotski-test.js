// @flow
import { assert } from 'chai';
import Klotski from '../src/klotski';

describe('Klotski', () => {
  let klotski;

  beforeEach(() => {
    klotski = new Klotski();
  });

  it('should solve the problem', () => {
    const result = klotski.solve();
    assert.equal(result, 4);
  });
});
