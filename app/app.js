//app.js
require('./utils/navigate/index.js');

import {
  getSettings
} from '/utils/wxUtils.js';
import {
  defaultEvents,
  defaultRelationships,
  defaultCommonMoney
} from '/utils/index.js'
// import {
//   makeFakeData
// } from './utils/fake'

wx.cloud.init({
  env: 'prod-cri6r',
  // env: 'one-letter-edebec',
  traceUser: true
})

const db = wx.cloud.database()
const giftCollection = db.collection('gift')

const device = wx.getSystemInfoSync()

App({
  onLaunch: function () {

    const that = this;

    this.globalData.gifts = wx.getStorageSync('GIFTS') || [];
    this.globalData.contacts = this._contacts(this.globalData.gifts);


    this._fetchAllGifts().then(allgifts => {
      that.globalData.gifts = allgifts

      that.onGiftsChanged()

      wx.setStorage({
        key: 'GIFTS',
        data: allgifts
      });

      if (that.giftsReadyCallback) {
        that.giftsReadyCallback(allgifts)
      }
    })

    this._fetchPreferences().then(res => {

      that.globalData.preferences = res;
    });

    getSettings().then(authSetting => {
      if (!authSetting || !authSetting['scope.userInfo']) {
        return
      }

      wx.getUserInfo({
        success: res => {
          // 可以将 res 发送给后台解码出 unionId
          this.globalData.userInfo = res.userInfo

          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res)
          }
        }
      })
    })
  },

  _sentGifts(gifts) {

    let sent = gifts.filter(gift => {
      return !gift.is_income
    })

    return this._sortGiftByDate(sent);
  },

  _receivedGifts(gifts) {
    let gs = gifts.filter(gift => {
      return gift.is_income
    })

    return this._sortGiftByDate(gs);
  },


  _groupedReceivedGifts(gifts) {
    const groups = {};

    for (let gift of gifts) {
      if (!gift.is_income) {
        continue;
      }

      if (!groups.hasOwnProperty(gift.event)) {
        groups[gift.event] = {
          event: gift.event,
          date: gift.date,
          is_income: true,
          total: 0,
          gifts: []
        };
      }

      groups[gift.event].gifts.push(gift);
      groups[gift.event].total += gift.amount;
    }

    const arr = [];
    for (let key in groups) {
      arr.push(groups[key]);
    }

    return arr;
  },

  _sortGiftByDate(gifts) {
    gifts = gifts.sort((a, b) => {
      if (a.date > b.date) {
        return -1
      } else if (a.date < b.date) {
        return 1
      }

      if (a.updated_at > b.updated_at) {
        return -1
      } else {
        return 1
      }

      return 0
    })

    return gifts;
  },

  _contacts(gifts) {
    let contactMap = {};

    let contacts = gifts.reduce((arr, cur) => {
      if (!cur.contact) {
        return arr;
      }

      if (contactMap[cur.contact.name]) {
        return arr;
      }

      contactMap[cur.contact.name] = true

      arr.push(Object.assign({}, cur.contact));

      return arr
    }, [])


    return contacts
  },

  async _fetchAllGifts() {
    let countResp = await giftCollection.count()
    let count = countResp.total

    let promises = []

    for (let i = 0; i < Math.floor(count / 20 + 1); i++) {
      promises.push(this._fetchGifts(i * 20))
    }

    let resps = await Promise.all(promises)


    let allData = resps.reduce((arr, cur) => {
      return arr.concat(cur.list || cur.data)
    }, [])

    return allData
  },

  async _fetchGifts(skip = 0) {
    if (this.globalData.debugModel) {
      return await giftCollection.where({
        fake: true
      }).skip(skip).get()
    }

    return await giftCollection.skip(skip).get()

    return await giftCollection.aggregate().sort({
      date: -1, // 日期从大到小，即从近到远
      updated_at: -1, // 从大到小
    }).skip(skip).end()
  },

  async _fetchPreferences(skip = 0) {
    const res = await db.collection('preferences').limit(1).get()

    const preferences = (res.list || res.data)[0] || null;

    if (preferences) return preferences;

    const data = {
      events: defaultEvents(),
      relationships: defaultRelationships(),
      common_money: defaultCommonMoney()
    }
    const result = await db.collection('preferences').add({
      data
    })

    data._id = result._id;

    return data;
  },

  globalData: {
    userInfo: null,
    preferences: {
      events: defaultEvents(),
      relationships: defaultRelationships()
    },
    gifts: [],
    sentGifts: [],
    receivedGifts: [],
    // groupedReceivedGifts: [],

    contacts: [],
    debugModel: false, //device.brand === "devtools"
  },

  device,

  onGiftsChanged() {
    this.globalData.contacts = this._contacts(this.globalData.gifts);
    this.globalData.sentGifts = this._sentGifts(this.globalData.gifts);
    this.globalData.receivedGifts = this._receivedGifts(this.globalData.gifts);
    // this.globalData.groupedReceivedGifts = this._groupedReceivedGifts(this.globalData.gifts);
  },

  deleteGift(gift) {
    let idx = this.globalData.gifts.findIndex(item => item._id === gift._id);

    if (idx < 0) return;

    this.globalData.gifts.splice(idx, 1);

    this.onGiftsChanged()
  },

  addGift(gift) {
    this.globalData.gifts.push(gift)

    this.onGiftsChanged();
  },

  updateGift(gift) {
    let idx = this.globalData.gifts.findIndex(item => item._id === gift._id);

    if (idx < 0) return;

    this.globalData.gifts.splice(idx, 1, gift);

    this.onGiftsChanged()
  },

  addOrUpdateGift(gift) {
    let idx = this.globalData.gifts.findIndex(item => item._id === gift._id);

    if (idx >= 0) {
      this.updateGift(gift);
    } else {
      this.addGift(gift);
    }
  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})