// app/pages/settings/settings/settings.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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