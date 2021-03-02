
const app = getApp()

Page({

  data: {
    events: app.globalData.preferences.events
  },

  onLoad: function (options) {
    
  },

  findGiftsWithEvent(event) {
    return app.gifts.find(i => i.event === event)
  },

  onTapAdd() {
    
  },

  onTapDelete(e) {
    const index = e.target.dataset.index;
    const event = this.data.events[index];

    const gifts = this.findGiftsWithEvent(event)

    wx.showModal({
      title: '确定删除 ' + event + '吗？',
      message: ''
    })
  },

  onShareAppMessage: function () {

  }
})