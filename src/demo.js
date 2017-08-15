var Klotski = require('./klotski');
var Games = {
  HengDaoLiMa: {
    startName: '横刀立马',
    heroCount: 10,
    caoIdx: 2,
    heroName: ['张飞', '曹操', '黄忠', '赵云', '关羽', '马超', '兵一', '兵二', '兵三', '兵四'],
    heroInfo: [2, 0, 0, 4, 0, 1, 2, 0, 3, 2, 2, 0, 3, 2, 1, 2, 2, 3, 1, 4, 0, 1, 3, 1, 1, 3, 2, 1, 4, 3]
  },
};

const klotski = new Klotski();
const result = klotski.solve(Games.HengDaoLiMa);

console.log(result);
