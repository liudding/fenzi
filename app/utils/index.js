export function updateCache(data) {
  try {
    let gifts = wx.getStorageSync("GIFTS") || [];

    let idx = gifts.findIndex(item => item._id === data._id);
    if (idx >= 0) {
      if (data.delete) {
        gifts.splice(idx, 1);
      } else {
        gifts.splice(idx, 1, data);
      }
    } else {
      gifts.push(data);
    }

    wx.setStorage({
      key: 'GIFTS',
      data: gifts
    });
    
  } catch (err) {
    console.error('updateCache error: ', err)
  }
}


export function defaultEvents() {
  return [
    "参加婚礼",
    "宝宝出生",
    "宝宝满月",
    "宝宝周岁",
    "压岁钱",
    "孩子升学",
    "金榜题名",
    "老人过寿",
    "乔迁新居",
    "新店开业",
    "探望病人",
    "追悼故人",
    "其他"
  ]
}

export function defaultRelationships() {
  return ["亲戚", "朋友", "同学", "同事", "邻里", "其他"];
}

export function defaultCommonMoney() {
  return [200, 400, 500, 600, 800, 1000];
}