import { parseTime, randomInt } from "./util.js";

export function  makeFakeData() {
  const db = wx.cloud.database()
  const giftCollection = db.collection('gift')

  const names = ['张山', '王科台', '孙看看', '李佳士', '柳即即', '张十佳', '王教科', '孙机算', '林士驾', '祝英台', '江祝山'];
  for (let i = 0; i < 100; i ++) {
    giftCollection.add({
      data: {
        amount: Math.floor(Math.random() * 10) * 100,
        created_at:  Date.parse(new Date()) / 1000,
        date: parseTime(new Date(), "{y}-{m}-{d}"),
        event: [ "参加婚礼",
        "参加葬礼",
        "宝宝出生",
        "宝宝满月",
        "宝宝周岁",
        "老人过寿",
        "金榜题名",
        "孩子升学",
        "乔迁新居",
        "新店开业",
        "探望病人",
        "其他"][randomInt(0, 10)],
        is_income: randomInt(0, 10) > 5,
        contact: {
          id: randomInt(10000, 999999) + '',
          name: names[randomInt(0, names.length - 1)],
          relationship: ["亲戚", "朋友", "同学", "同事", "邻里", "其他"][randomInt(0, 5)],
        },
        fake: true
      }
    });
  }
}
