// @flow
import Klotski from './klotski';
import Games from './klotski/Games.json';

const klotski = new Klotski();
const result = klotski.solve(Games.HengDaoLiMa);

console.log(result);
