const iconsMap = [{
  icon: "👰🏻",
  keys: ['婚礼', '结婚']
}, {
  icon: "💐",
  keys: ['葬礼', '去世', '追悼']
}, {
  icon: "🤱🏻",
  keys: ['出生', '得子', '降生', '出世']
}, {
  icon: "👶🏻",
  keys: ['满月', '百天']
}, {
  icon: "🧒🏻",
  keys: ['周岁']
}, {
  icon: "🎂",
  keys: ['生日', '大寿', '过寿']
}, {
  icon: "🥇",
  keys: ['金榜', '得奖', '获奖']
}, {
  icon: "🎓",
  keys: ['升学', '大学']
},{
  icon: "🏡",
  keys: ['乔迁', '新家', '新居']
},{
  icon: "🏬",
  keys: ['新店', '开业']
}, {
  icon: "🏥",
  keys: ['病人', '慰问']
}]


export default function decideIconOfEvent(event) {
  if (!event) {
    return "🧧";
  }
  
  for (let icon of iconsMap) {
    for (let key of icon.keys) {
      if (event.indexOf(key) >= 0) {
        return icon.icon
      }
    }
  }

  return "🧧";
}