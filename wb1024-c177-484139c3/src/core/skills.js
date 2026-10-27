/* skills.js - 技能定义（H5 / 小程序共用）
 * target: none | point(空点) | own-stone | enemy-stone | area(区域中心)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    (root.SkillGo = root.SkillGo || {}).Skills = factory();
  }
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this), function () {
  'use strict';

  var SKILLS = [
    {
      id: 'fortify',
      name: '磐石',
      tag: '加固',
      icon: '◇',
      cost: 2,
      cd: 4,
      target: 'own-stone',
      type: 'self',
      color: '#f2c14e',
      desc: '指定己方一颗棋子，其所在整块棋 3 回合内免疫被提。',
      tip: '点击自己的一颗棋子'
    },
    {
      id: 'airdrop',
      name: '飞石',
      tag: '空降',
      icon: '✦',
      cost: 3,
      cd: 5,
      target: 'point',
      type: 'self',
      color: '#5ad2a0',
      desc: '在任意空点额外落一子，不占用本回合落子机会，可正常提子。',
      tip: '点击一个空交叉点'
    },
    {
      id: 'ban',
      name: '封印',
      tag: '禁行',
      icon: '✕',
      cost: 2,
      cd: 4,
      target: 'point',
      type: 'enemy',
      color: '#e86a6a',
      desc: '封锁一个空点，对手 3 回合内不能在此落子。',
      tip: '点击要封锁的空点'
    },
    {
      id: 'fog',
      name: '障眼',
      tag: '迷雾',
      icon: '☁',
      cost: 2,
      cd: 5,
      target: 'area',
      type: 'enemy',
      color: '#8f9bd8',
      desc: '以该点为中心的 3×3 区域起雾，对手 3 回合内看不见这片棋子。',
      tip: '点击区域中心'
    },
    {
      id: 'quake',
      name: '震星',
      tag: '地裂',
      icon: '⚡',
      cost: 4,
      cd: 6,
      target: 'enemy-stone',
      type: 'enemy',
      color: '#ff9f43',
      desc: '直接拔掉对手一颗棋子，随后结算双方气。可一击破眼、断连。',
      tip: '点击对手的一颗棋子'
    },
    {
      id: 'sight',
      name: '天眼',
      tag: '洞察',
      icon: '◉',
      cost: 1,
      cd: 3,
      target: 'none',
      type: 'self',
      color: '#4fc4f5',
      desc: '点亮势力图 3 回合：显示当前空点归属预测，辅助围地判断。',
      tip: '无需目标，直接使用'
    }
  ];

  var MAP = {};
  for (var i = 0; i < SKILLS.length; i++) MAP[SKILLS[i].id] = SKILLS[i];

  return {
    LIST: SKILLS,
    MAP: MAP,
    get: function (id) { return MAP[id] || null; }
  };
});
