
const app = getApp();

Page({

  data: {
    contacts:[]
  },

  onLoad: function (options) {
    this.setData({
      contacts: app.globalData.contacts
    })
  },

})