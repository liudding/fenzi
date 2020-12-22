
import decideIconOfEvent from '../../../utils/eventIcon'


Page({


  data: {
    gifts: [],
  },

  onLoad: function (options) {
    this.eventChannel = this.getOpenerEventChannel()
 
    this.eventChannel.on('acceptDataFromOpenerPage', function(data) {
      this.event = data;

      wx.setNavigationBarTitle({ title: this.event.event });

      const gifts = this.event.gifts.map(item => {
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

  gotoBatchAdd() {
    wx.navigateTo({
      url: '/pages/edit/batch/batch',
      events: {
        giftChanged: (gift) => {
          this.data.gifts.push(gift)
    
          this.setData({
            gifts: this.data.gifts
          })

          this.eventChannel.emit('giftChanged', gift)
        }
      },
      success: (res) => {
        res.eventChannel.emit('acceptDataFromOpenerPage', this.event)
      }
    })
  },

  onTapCreate() {

    const that = this;

    let gift = {
      event: this.event.event,
      date: this.event.date,
      is_income: true
    }

    // that.gotoEdit(gift);

    wx.showActionSheet({
      itemList: ['记多笔', '记一笔'], //按钮的文字数组，数组长度最大为6个,
      itemColor: '#000000', //按钮的文字颜色,
      success: res => {

        if (res.tapIndex === 0) {
          that.gotoBatchAdd();
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