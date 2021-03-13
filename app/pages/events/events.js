const app = getApp()

const db = wx.cloud.database();
const preferences = db.collection("preferences");

Page({

  data: {
    events: [],

    showModal: false,

    form: {
      name: '',
      old: null
    }
  },

  onLoad: function (options) {
    this.setData({
      events: app.globalData.preferences.events,
    })
  },

  findGiftsWithEvent(event) {
    return app.gifts.find(i => i.event === event)
  },

  inputChange(e) {
    const {
      field
    } = e.currentTarget.dataset;

    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  async submitForm() {
    if (!this.data.form.name) {
      wx.showModal({
        title: "提示",
        content: "请填写事件名称",
        showCancel: false
      });
      return;
    }

    if (this.data.form.name.length > 10) {
      wx.showModal({
        title: "提示",
        content: "事件名称过长",
        showCancel: false
      });
      return;
    }


    if (this.data.form.old) {
      const idx = this.data.events.findIndex(i => i === this.data.form.name)
      this.data.events.splice(idx, 1, this.data.form.name)
    } else {
      this.data.events.push(this.data.form.name)
    }

    await this.updatePreferences(this.data.events)

    this.setData({
      events: this.data.events
    })

    app.globalData.preferences.events = this.data.events
  },

  async updatePreferences(events) {
    wx.showLoading({
      title: "保存中..."
    });


    if (!app.globalData.preferences._id) {

      await preferences.add({
        data: {
          events,
          relationships: app.globalData.preferences.relationships
        }
      })

      return;
    }

    preferences.doc(app.globalData.preferences._id).update({
      data: {
        events
      }
    });

    wx.hideLoading()
  },

  onTapAdd() {
    this.setData({
      showModal: true
    })
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