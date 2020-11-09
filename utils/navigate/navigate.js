const utils = require('./utils.js')

let pageData = {
  from: '', // 来源页面路由
  to: '',
  data: null
}

let backCallbacks = []


const excuteCallback = (currentPageRoute, lastPageRoute, data, onBack=true) => {
  var callbackIdx = -1
  for (const cb of backCallbacks) {
    if (cb.from == lastPageRoute && cb.to == currentPageRoute) {
      cb.callback && cb.callback(data)

      callbackIdx = backCallbacks.indexOf(cb)
      break;
    }
  }

  if (onBack && callbackIdx > -1) {
    backCallbacks.splice(callbackIdx, 1) // 删除已被使用的回调
  }
}

const removeOldCallback = (data) => {
  var callbackIndex = -1
  for (const cb of backCallbacks) {
    if (cb.from == data.from && cb.to == data.to) {
      callbackIndex = backCallbacks.indexOf(cb)
      console.warn('已经存在相同的页面回调: 【' + cb.from + '】 到 【' + cb.to + '】，将删除旧的回调。')
      break;
    }
  }

  if (callbackIndex > -1) {
    backCallbacks.splice(callbackIndex, 1) // 删除相同的且是旧的回调
  }
}

const addCallback = (callbackData) => {
  backCallbacks.push(callbackData)
}

const getCurrentPage = () => {
  const currentPages = getCurrentPages();
  if (currentPages.length > 0) {
    return currentPages[currentPages.length - 1]
  } else {
    throw new Error('当前页面未知')
  }
}


const naviTo = (to, params, onBackCallback = null) => {

  const f = getCurrentPage()

  const fromRoute = utils.formatRoute(f.route)

  pageData = {
    'from': fromRoute,
    to: to,
    data: params
  }

  if (onBackCallback) {
    removeOldCallback(pageData)

    addCallback({
      'from': fromRoute,
      to: to,
      callback: onBackCallback
    })
  }


  wx.navigateTo({
    url: to,
    success: function (res) { },
    fail: function (err) { 
      console.error('wx.navigateTo FAIL: ', err)
    },
    complete: function (res) { },
  })
}


const naviBack = (data) => {
  const currentPages = getCurrentPages();

  if (currentPages.length <= 1) {
    wx.navigateBack()
    return
  }

  const lastPage = currentPages[currentPages.length - 2]
  const currentPage = currentPages[currentPages.length - 1]
  const currentPageRoute = utils.formatRoute(currentPage.route)
  const lastPageRoute = utils.formatRoute(lastPage.route)

  excuteCallback(currentPageRoute, lastPageRoute, data)

  wx.navigateBack()
}

const naviCallback = (data) => {
  const currentPages = getCurrentPages();

  if (currentPages.length <= 1) {
    return
  }

  const lastPage = currentPages[currentPages.length - 2]
  const currentPage = currentPages[currentPages.length - 1]
  const currentPageRoute = utils.formatRoute(currentPage.route)
  const lastPageRoute = utils.formatRoute(lastPage.route)

  excuteCallback(currentPageRoute, lastPageRoute, data, false)
}

const rediTo = (to, params) => {
  const from = getCurrentPage()

  const fromRoute = utils.formatRoute(from.route)

  pageData = {
    from: fromRoute,
    to: to,
    data: params
  }

  wx.redirectTo({
    url: to,
    success: function (res) { },
    fail: function (res) { },
    complete: function (res) { },
  })
}


const getPageData = (page) => {
  if (!page) {
    page = getCurrentPage()
  }
  if (utils.formatRoute(page.route) !== pageData.to) {
    return null
  }

  let data = pageData.data

  delete pageData.data

  return data
}

module.exports = {
  naviTo,
  naviBack,
  rediTo,
  getPageData,
  naviCallback
}
