const app = getApp()

const db = wx.cloud.database();
const preferences = db.collection("preferences");

import {
  defaultCommonMoney
} from '../../../utils/index'


Page({

  data: {
    showMoneyModal: false,

    moneyForm: [],
  },


  onLoad: function (options) {

    const moneyForm = app.globalData.preferences.common_money.concat() || defaultCommonMoney()

    this.setData({
      moneyForm
    })
  },

  inputChange(e) {
    const {
      field
    } = e.currentTarget.dataset;

    this.setData({
      [`moneyForm[${field}]`]: e.detail.value
    });

  },

  async submitForm() {
    const money = this.data.moneyForm.map(i => +i);

    await preferences.doc(app.globalData.preferences._id).update({
      data: {
        common_money: money
      }
    })

    wx.showToast({
      title: '更新成功',
    })

    this.setData({
      showMoneyModal: false
    })
  },

  onTapMoney() {
    this.setData({
      showMoneyModal: true
    })
  },

  onTapEvents() {
    wx.navigateTo({
      url: '/pages/events/events',
    })
  },

  onTapExport() {
    wx.navigateTo({
      url: '/pages/settings/export/export',
    })
  },

})