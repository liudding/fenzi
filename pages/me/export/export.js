
Page({

  data: {

  },

  onLoad: function (options) {
    let gifts = wx.getStorageSync('GIFTS')

    let text = gifts.reduce((arr, cur) => {
      let line = `${cur.contact.name}\t${cur.contact.relationship}\t${cur.amount}\t${cur.event}\t${cur.is_income ? '收到' : '给出'}\t${cur.date} \t${cur.note || ''}\n`
      return arr + line
    }, '')

    this.setData({
      text: text
    })
  },

  onTapCopy() {
    wx.setClipboardData({
      data: this.data.text,
    })
  }

})