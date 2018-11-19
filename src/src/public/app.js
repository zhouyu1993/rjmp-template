const api = require('./common/api')
const request = require('./common/request')
const tracker = require('./lib/tracker')
tracker.init({
  appid: 6, // 必填，appid为在孩子王配置平台生成的id,非小程序自带id
  platformid: 1, // 平台ID，孩子王1，成长加2，默认1
  biztype: '020', // 业务类型，默认001
  auto: true, // 是否开启自动上报，默认false
  pageid: '100025', // 开启自动上报时，默认的pageid
  eventid: '100025', // 开启自动上报时，默认的eventid
  // 开启自动上报时，排除的页面路径
  exclude: [
    'pages/mall-index/index',
    'pages/store-index/index',
    'pages/index/index',
    'pages/evaluate/index',
  ],
})
//app.js
App({
  onLaunch: function() {
    //调用API从本地缓存中获取数据
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    this.getRegionList()
  },
  // 获取省市区
  getRegionList() {
    let regionList = wx.getStorageSync('regionList')
    if (!regionList) {
      // 请求数据
      request({
        url: api.API_GET_REGIONS,
        isSuccess: json => !!json,
        success: json => {
          if (json && json.AddressList && json.AddressList.length > 0) {
            wx.setStorageSync('regionList', json.AddressList)
          }
        },
      })
    }
  },
  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == 'function' && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function() {
          wx.getUserInfo({
            success: function(res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == 'function' && cb(that.globalData.userInfo)
            },
          })
        },
      })
    }
  },
  globalData: {
    userInfo: null,
  },
})
