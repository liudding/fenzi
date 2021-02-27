//index.js
//获取应用实例
const app = getApp()

const db = wx.cloud.database()
const giftCollection = db.collection('gift')

import {
  groupBy
} from '../../utils/util.js';
import {
  updateCache
} from "../../utils/index.js";

import decideIconOfEvent from '../../utils/eventIcon'


Page({
  data: {
    title: '送出的',
    total: 0,
    gifts: [],
    myEvents: [],
    contacts: [],

    tabs: [{title: '亲友'},{title: '送出'}, {title: '收到'}],
    currentTab: 1,

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
      // console.log('giftsReadyCallback called');
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


  getContacts() {
    let groups = groupBy(app.globalData.gifts, 'contact.name')

    let contacts = [];

    for (let key in groups) {
      let gifts = groups[key];

      let contact = Object.assign({}, gifts[0].contact)

      contact.gifts = gifts

      contacts.push(contact);
    }

    return contacts
  },

  getMyEvents() {
    const groups = {};

    for (let gift of app.globalData.receivedGifts) {
      if (!gift.is_income) {
        continue;
      }

      if (!groups.hasOwnProperty(gift.event)) {
        groups[gift.event] = {
          event: gift.event,
          icon: decideIconOfEvent(gift.event),
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


  updateUI() {
    let gifts =  app.globalData.sentGifts;
    let myEvents = this.getMyEvents();

    let contacts = this.getContacts();

    gifts = gifts.map(item => {
      item.icon = decideIconOfEvent(item.event)

      return item;
    })

    let incomeTotal = myEvents.reduce((arr, cur) => {
      return arr + cur.total;
    }, 0);
    let outgoingTotal = gifts.reduce((arr, cur) => {
      return arr + cur.amount;
    }, 0)

    this.setData({
      gifts,
      myEvents,
      contacts,
      outgoingTotal,
      incomeTotal
    })
  },

  onSegmentChange(e) {
    const index = e.detail;

    this.setData({
      currentTab: index
    })

    if (index === 0) {

    } else if (index === 1) {

    } else if (index === 2) {

    }
  },

  onTapContact(e) {
    let index = e.currentTarget.dataset.index
    let contact = this.data.contacts[index]

    wx.navigateTo({
      url: '/pages/index/gifts/gifts',
      events: {
        giftChanged: (gift) => {
          this.onGiftDataChanged(gift)
        }
      },
      success: (res) => {
        res.eventChannel.emit('acceptDataFromOpenerPage', contact)
      }
    })

  },

  onTapEvent(e) {
    let index = e.currentTarget.dataset.index
    let event = this.data.myEvents[index]

    wx.navigateTo({
      url: '/pages/index/event/event',
      events: {
        giftChanged: (gift) => {
          this.onGiftDataChanged(gift)
        }
      },
      success: (res) => {
        res.eventChannel.emit('acceptDataFromOpenerPage', event)
      }
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