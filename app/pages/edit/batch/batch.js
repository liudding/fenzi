const app = getApp();

const db = wx.cloud.database();
const giftCollection = db.collection("gift");

import { updateCache } from "../../../utils/index.js";


Page({

  data: {
    gifts: [],
    showConfirm: false
  },


  onLoad: function (options) {

    this.eventChannel = this.getOpenerEventChannel()
 
    this.eventChannel.on('acceptDataFromOpenerPage', function(data) {
      this.event = data;

      wx.setNavigationBarTitle({ title: this.event.event });
    }.bind(this))
  },

  onBlur(e) {
    const {value} = e.detail

    this.data.value = value;
  },

  parseTextGifts(text) {
    const gifts = [];

    const textGifts = text.split('\n')
    for (let tg of textGifts) {
      const parts = tg.split(' ').filter(i => i)

      if (parts.length === 0) continue;

      gifts.push({
        event: this.event.event,
        date: this.event.date,
        contact: {
          name: parts[0]
        },
        amount: +parts[1] || 0,
        is_income: this.event.is_income
      })
    }

    return gifts;
  },

  submit() {
    if (!this.data.value) {
      return;
    }

    const gifts = this.parseTextGifts(this.data.value);

    let existed = this.event.gifts.map(item => item.contact.name);

    for (let gift of gifts) {
      let contact = app.globalData.contacts.find(
        item => item.name === gift.contact.name
      );
      let relationship = contact ? contact.relationship : "";
      gift.contact.relationship = relationship;

      if (gift.amount === 0) {
        gift.error = '缺金额';
      }

      if (existed.indexOf(gift.contact.name) >= 0) {
        // 重复了
        gift.error = '重复';  
      } else {
        existed.push(gift.contact.name)
      }
    }

    // 确认

    this.setData({gifts, showConfirm: true})
  },

  onConfirm() {
    // const hasError = this.data.gifts.find(item => item.error)
    // if (hasError) {
    //   wx.showModal({
    //     title: "提示",
    //     content: "请填写数字",
    //     showCancel: false
    //   });
    //   return;
    // }

    wx.showLoading({
      title: "保存中..."
    });

    const createdAt = Date.parse(new Date()) / 1000;
    for (let gift of this.data.gifts) {
      if (gift.error) {
        continue;
      }

      const temp = {
        amount: gift.amount,
        event: gift.event,
        date: gift.date,
        contact: {
          name: gift.contact.name,
          relationship: gift.contact.relationship
        },
        is_income: gift.is_income,
        created_at: createdAt,
        updated_at: createdAt
      }

      if (app.globalData.debugModel) {
        temp.fake = true
      }

      giftCollection.add({
        data: temp
      }).then(res => {
        temp._id = res._id;

        updateCache(temp);
  
        app.addGift(temp)

        this.eventChannel.emit('giftChanged', temp)
      });
    }

    wx.hideLoading();

    wx.showToast({
      title: "保存成功",
      icon: "success",
      duration: 2000
    });

    wx.navigateBack()
  }
})