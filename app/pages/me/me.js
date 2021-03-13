const app = getApp()

import {
  getSettings
} from '../../utils/wxUtils.js'


Page({

  data: {
    userInfo: {

    },
    showProfile: true,
    showPinPrompt: false
  },

  onLoad: function (options) {
    const that = this

    getSettings().then(authSetting => {
      if (!authSetting['scope.userInfo']) {
        // 未授权信息
        that.setData({
          showProfile: false
        })

      } else {
        that.init()
      }
    })


  },

  init() {
    if (app.globalData.userInfo) {
      this.setData({
        showProfile: true,
        userInfo: app.globalData.userInfo
      })
    } else {
      app.userInfoReadyCallback = res => {
        this.setData({
          showProfile: true,
          userInfo: res.userInfo
        })
      }
    }
  },

  onTapLogin(e) {
    if (!e.detail.userInfo) {
      wx.showModal({
        title: '您拒绝了授权登录',
        content: '您必须登录之后，才能正常使用',
        showCancel: false
      })

      return
    }

    app.globalData.userInfo = e.detail.userInfo

    this.init()

  },


  onTapEdit() {
    return
    wx.navigateTo({
      url: '/pages/me/profile/profile',
    })
  },

  onTapPersonalize() {
    return
    wx.navigateTo({
      url: '/pages/me/personalize/personalize',
    })
  },

  onTapPin() {
    this.setData({
      showPinPrompt: false
    })
    this.setData({
      showPinPrompt: true
    })
  },

  onTapSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings/settings',
    })
  },


  onTapHelp() {
    wx.navigateTo({
      url: '/pages/me/help/help',
    })
  },

  onTapCardllet() {
    wx.navigateToMiniProgram({
      appId: 'wx6f0c5ff8030a44eb'
    })
  },

  onTapPoem() {
    wx.navigateToMiniProgram({
      appId: 'wx49ddf9db7be1dec0'
    })
  },

  onTapElem() {
    // https://h5.ele.me/ant/qrcode?open_type=miniapp&url_id=35&inviterId=154cb7c
    wx.navigateToMiniProgram({
      appId: 'wxece3a9a4c82f58c9',
      path: 'ele-recommend-price/pages/index/index?inviterId=154cb7c'
    })
  },

  onShareAppMessage: function () {
    return {
      title: '记录人情往来份子钱',
      path: '/pages/index/index',
      imageUrl: '../../images/share-cover.png'
    }
  },
  onShareTimeline() {
    return {
      title: '记录人情往来份子钱',
      query: 'from=timeline',
      imageUrl: '../../images/share-cover.png'
    }
  }
})