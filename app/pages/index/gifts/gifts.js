// pages/index/gifts/gifts.js
import decideIconOfEvent from '../../../utils/eventIcon'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    gifts: [],
  },

  onLoad: function (options) {
    this.eventChannel = this.getOpenerEventChannel()
 
    this.eventChannel.on('acceptDataFromOpenerPage', function(data) {
      this.contact = data;

      wx.setNavigationBarTitle({ title: this.contact.name });

      const gifts = this.contact.gifts.map(item => {
        item.icon = decideIconOfEvent(item.event)
        return item;
      })

      this.setData({
        gifts: gifts
      });
    }.bind(this))
  },


  onTapGift(e) {

    let index = e.currentTarget.dataset.index
    let gift = this.data.gifts[index]

    this.gotoEdit(gift)
  },

  gotoEdit(data) {

    wx.naviTo('/pages/edit/edit', data, gift => {

      if (!gift || !gift._id) {
        return
      }

      this.eventChannel.emit('giftChanged', gift)
      
      let index = this.data.gifts.findIndex(item => item._id === gift._id);

      if (gift.delete) {
        this.data.gifts.splice(index, 1)
        this.setData({
          gifts: this.data.gifts
        })

        if (this.data.gifts.length === 0) {
          wx.navigateBack()
        }

        return;
      }

     
      gift.icon = decideIconOfEvent(gift.event)

      if (index >= 0) {
        this.setData({
          [`gifts[${index}]`]: gift
        })
      } else {
        this.setData({
          [`gifts[${this.data.gifts.length}]`]: gift
        })
      }
    })
  },

  onTapCreate() {

    const that = this;

    wx.showActionSheet({
      itemList: ['给份子', '收份子'], //按钮的文字数组，数组长度最大为6个,
      itemColor: '#000000', //按钮的文字颜色,
      success: res => {
        let gift = {
          contact: {
            // id: this.contact.id,
            name: this.contact.name,
            relationship: this.contact.relationship,
          },
          is_income: false
        }

        if (res.tapIndex === 0) {
          that.gotoEdit(gift);
        } else if (res.tapIndex === 1) {
          gift.is_income = true;

          that.gotoEdit(gift);
        }
      }
    });


  },

  onShareAppMessage: function () {

  }
})