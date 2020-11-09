//index.js
//获取应用实例
const app = getApp()

const db = wx.cloud.database()
const giftCollection = db.collection('gift')

import {
  getSettings
} from '../../utils/wxUtils.js';
import {
  updateCache
} from "../../utils/index.js";


Page({
  data: {
    title: '送出的',
    total: 0,
    isIncome: false,
    gifts: [],
    groups: [],

    slideButtons: [{
      text: '编辑',
    }, {
      type: 'warn',
      text: '删除',
    }],

    showPin: false
  },
  allGifts: app.globalData.gifts,

  onLoad: function() {
    const that = this;

    that.init()

    that.handlePin()
  },

  init() {
    const that = this;

    // this.allGifts = app.globalData.gifts

    app.giftsReadyCallback = (res) => {
      console.log('giftsReadyCallback called');
      // that.allGifts = app.globalData.gifts

      that.updateUI();
    }

    that.updateUI();
  },

  handlePin() {
    const launchTimes = wx.getStorageSync('LAUNCH_TIMES') || 1;
    if (launchTimes === 1 ) {
      this.setData({
        showPin: true
      })

      setTimeout(() => {
        this.setData({
          showPin: false
        })
      }, 5000)
    }

    wx.setStorage({
      key: 'LAUNCH_TIMES',
      data: launchTimes + 1,
    })
  },


  updateUI(isIncome = false) {
    let gifts =  app.globalData.sentGifts;
    let groups = app.globalData.groupedReceivedGifts;

    const iconMap = {
      '参加婚礼': "👰🏻",
      '参加葬礼': "👼",
      '宝宝出生': "🤱🏻",
      '宝宝满月': "👶🏻",
      '宝宝周岁': "🧒🏻",
      '老人过寿': "🎂",
      '金榜题名': "🥇",
      '孩子升学': "🧑🏻‍🎓",
      '乔迁新居': "🏡",
      '新店开业': "🏬",
      '探望病人': "🏥",
    }

    gifts = gifts.map(item => {
      const g = Object.assign({}, item);

      g.event = (iconMap[g.event] || '') + g.event
      return g;
    })

    let total = 0;
    if (isIncome) {
      total = groups.reduce((arr, cur) => {
        return arr + cur.total;
      }, 0)
    } else {
      total = gifts.reduce((arr, cur) => {
        return arr + cur.amount;
      }, 0)
    }

    this.setData({
      isIncome,
      gifts,
      groups,
      total
    })
  },

  onTapFilter() {

    let isIncome = !this.data.isIncome

    this.updateUI(isIncome)
  },

  onTapGroup(e) {
    let index = e.currentTarget.dataset.index
    let group = this.data.groups[index]

    const that = this;

    wx.naviTo('/pages/event/event', group, gift => {

      // if (!gift || !gift._id) {
      //   return
      // }

      // that.onGiftDataChanged(gift)
    })

  },

  onTapAddGroupedGift(e) {
    let group = e.detail
    this.gotoEdit(group)
  },

  onTapGroupedGift(e) {
    let gift = e.detail
    this.gotoEdit(gift)
  },

  onTapGift(e) {

    let index = e.currentTarget.dataset.index
    let gift = this.data.gifts[index]

    this.gotoEdit(gift)
  },

  onLongPressGift(e){
    let index = e.currentTarget.dataset.index
    let gift = this.data.gifts[index]

    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.gotoEdit(gift)
        } else if (res.tapIndex === 1) {
          this.deleteGift(gift)
        }
      }
    })
  },

  onTapCreate() {

    const that = this;

    wx.showActionSheet({
      itemList: ['给份子', '收份子'], //按钮的文字数组，数组长度最大为6个,
      itemColor: '#000000', //按钮的文字颜色,
      success: res => {
        if (res.tapIndex === 0) {
          that.gotoEdit({
            is_income: false
          });
        } else if (res.tapIndex === 1) {
          that.gotoEdit({
            is_income: true
          });
        }
      }
    });


  },

  onGiftDataChanged(gift) {
    const that = this;

    that.updateUI(that.data.isIncome)
  },

  gotoEdit(data) {
    const that = this;

    wx.naviTo('/pages/edit/edit', data, gift => {

      if (!gift || !gift._id) {
        return
      }
      that.onGiftDataChanged(gift)
    })
  },

  onTapAction(e) {

  },

  onTapSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  deleteGift(gift) {
    const that = this

    wx.showModal({
      title: '确定删除吗',
      content: '删除之后不可恢复',
      confirmColor: '#FF6C6C',
      confirmText: '删除',
      success(res) {
        if (!res.confirm) {
          return
        }

        that.doDelete(gift._id)
      }
    })
  },

  slideButtonTapped(e) {
    let giftIndex = e.currentTarget.dataset.index
    let idx = e.detail.index


    let gift = this.data.gifts[giftIndex]

    const that = this;

    if (idx === 1) {
      // 删除
     

    } else {
      this.gotoEdit(gift)
    }

  },

  doDelete(id) {
    const that = this;

    wx.showLoading({
      title: '删除中...',
    })
    giftCollection.doc(id).remove().then(res => {

      let data = {
        _id: id,
        delete: true
      }

      updateCache(data)

      app.deleteGift(data)

      that.onGiftDataChanged(data)

      wx.hideLoading()
    })
  },

  onShareAppMessage: function() {

  }
})