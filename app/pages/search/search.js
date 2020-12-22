const app = getApp()

import Fuse from '../../utils/fuse/fuse.js'

Page({


  data: {
    value: '',
    fuseOptions: {
      shouldSort: true,
      tokenize: true,
      threshold: 0.2,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        { name: 'contact.name', weight: 0.7 },
        { name: 'event', weight: 0.4 },
        { name: 'contact.relationship', weight: 0.3 },
        { name: 'amount', weight: 0.1 },
      ]
    },
  },
 

  onLoad: function(options) {
    this.setData({
      search: this.search.bind(this)
    })

    var options = this.data.fuseOptions;
    this.fuse = new Fuse(app.globalData.gifts, options);
  },

  search: function(value) {
    return new Promise((resolve, reject) => {
      var result = this.fuse.search(value);

      const r = result.map(item => {
        return {
          name: item.contact.name,
          event: item.event,
          amount: item.amount,
          value: item._id,
          is_income: item.is_income
        }
      })

      resolve(r);
    })
  },

  selectResult: function(e) {
    let data = e.detail

    let item = app.globalData.gifts.find(i => i._id === data.item.value)

    if (!item) {
      wx.showModal({
        title: '数据不存在',
        content: '该数据可能已经被删除',
        showCancel: false
      })
      return 
    }

    this.gotoEdit(item)
  },

  gotoEdit(data) {
    const that = this;

    wx.naviTo('/pages/edit/edit', data, gift => {
      that.fuse = new Fuse(app.globalData.gifts, that.data.fuseOptions);
    })
  },
})