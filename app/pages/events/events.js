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
      events: app.globalData.preferences.events.concat([]),
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
    const newEvent = this.data.form.name.trim();

    if (!newEvent) {
      wx.showToast({
        title: "请填写事件名称",
        icon: "error"
      });
      return;
    }

    if (newEvent > 10) {
      wx.showModal({
        title: "事件名称过长",
        icon: "error"
      });
      return;
    }

    if (newEvent === this.data.form.old) {
      this.setData({
        showModal: false
      })

      wx.showToast({
        title: "未作更改",
        icon: "none"
      });

      return
    }


    const idx = this.data.events.findIndex(i => i === newEvent)

    if (idx >= 0) {
      wx.showToast({
        title: '同名事件已存在',
        icon: 'error'
      })

      return
    }


    if (this.data.form.old) { // update
      const index = this.data.events.findIndex(i => i === this.data.form.old)

      this.data.events.splice(index, 1, newEvent)
    } else { // create new
      this.data.events.push(newEvent)
    }

    await this.updatePreferences(this.data.events)
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
    } else {
      await preferences.doc(app.globalData.preferences._id).update({
        data: {
          events
        }
      });
    }

    this.setData({
      events: events,
      showModal: false
    })

    app.globalData.preferences.events = events

    wx.hideLoading()

    wx.showToast({
      title: '更新成功',
    })
  },


  onTapEvent(e) {
    const index = e.currentTarget.dataset.index;
    const event = this.data.events[index];

    wx.showActionSheet({
      alertText: event,
      itemList: ['编辑', '删除'],
      success: res => {
        if (res.tapIndex === 0) {
          this.setData({
            showModal: true,
            form: {
              name: event,
              old: event
            }
          })
        } else if (res.tapIndex === 1) {
          this.onDelete(event)
        }
      }
    })
  },

  onTapAdd() {
    this.setData({
      form: {name: '', old: null},
      showModal: true
    })
  },

  onDelete(event) {
    wx.showModal({
      title: '确定删除 ' + event + '吗？',
      content: '不会删除相关的份子记录',
      success: (res) => {
        if (res.confirm) {
          const index = this.data.events.findIndex(i => i === event);
          this.data.events.splice(index, 1)

          this.updatePreferences(this.data.events)
        }
      }
    })
  },

  onShareAppMessage: function () {

  }
})