//index.js
const {API_USER_REGISTER, API_USER_LOGIN} = require('../../../common/api')
const request = require('../../../common/request')
const {appId} = require('../../../common/constants')
const {webViewUrl} = require('../../../common/util')
const { hex_md5 : hexMD5 } = require('../../../common/md5')
// 用户信息存储
const userInfo = {}
// 登录态写入localStorage
function setStorage(passport, success = () => {}) {
  wx.setStorage({
    key: 'passport',
    data: passport,
    success: () => {
      success(passport)
    },
  })
}

Page({
  data: {
    showBtn: false,
  },
  showToast: function(toast, duration = 1500) {
    this.setData({toast})
    setTimeout(() => {
      this.setData({toast: ''})
    }, duration)
  },
  onTapAgreement() {
    wx.navigateTo({
      url: webViewUrl(`https://passport.cekid.com/agreement`)
    })
  },
  onTapPrivacy() {
    wx.navigateTo({
      url: webViewUrl(`https://passport.cekid.com/privacyProtection`)
    })
  },
  login: function(encryptedData, iv, openid) {
    request({
      url: API_USER_REGISTER,
      method: 'POST',
      showLoading: false,
      data: {
        appid: appId,
        encryptedData,
        iv,
        openid,
      },
      success: json => {
        const {skey, uid} = json.data
        setStorage({skey, uid})
        this.loginSuccess()
      },
      noLogin: () => {
        // 未注册
        wx.redirectTo({
          url: `/public/pages/common/register/index?${
            this.eid !== undefined ? `eid=${this.eid}&` : ''
          }${this.sid !== undefined ? `sid=${this.sid}&` : ''}${
            this.backHome !== undefined ? `backhome=${this.backHome}` : ''
          }`,
        })
        wx.showToast({title: '授权成功，建议使用微信登录', icon: 'none'})
      },
      fail: () => {
        wx.showToast({title: '网络异常', icon: 'none'})
      },
      complete: () => {},
    })
  },

  fail(title) {
    wx.showToast({
      title, 
      icon: 'none'
    })
  },

  onWeixinRegTap: function(e) {
    let {detail} = e
    let {errMsg} = detail
    if (errMsg !== 'getUserInfo:ok') return
    const {encryptedData, iv} = detail
    const {openid} = userInfo
    this.login(encryptedData, iv, openid)
  },
  loginSuccess() {
    if (this.referer) {
      let url = this.referer
      if (/^http(s)?:\/\//.test(url)) {
        url = webViewUrl(url)
      }
      console.log(url)
      wx.redirectTo({url})
    } else {
      wx.navigateBack()
    }
  },
  fail(msg) {
    msg && wx.showToast({title: msg, icon: 'none'})
  },
  formSubmit(e) {
    let formId = e.detail && e.detail.formId
    let appId = 'wx38c03f55ea0ab651'
    if (formId && formId !== 'the formId is a mock one') {
      wx.login({
        success: ({ code }) => {
          wx.request({
            url: 'https://miniapp.cekid.com/wxdata/api/v1/appInfo/saveInfo',
            data: {
              app_id: appId,
              form_id: formId,
              code,
              sign: hexMD5(`${appId}${formId}${code}0hzw365`),
            },
          })
        },
      })
    }
  },
  onLoad: function(option) {
    this.eid = option.eid
    this.sid = option.sid
    this.backHome = option.backhome
    this.referer = option.referer && decodeURIComponent(option.referer)
    const fail = this.fail
    if (!option.openid) {
      wx.showLoading({title: '加载中……'})
      wx.login({
        success: res => {
          if (!res.code) {
            this.fail('获取微信登录失败')
            return
          }
          // 发起登录请求
          request({
            url: API_USER_LOGIN,
            data: {
              code: res.code,
              appid: appId,
            },
            showLoading: false,
            success: json => {
              wx.hideLoading()
              const {skey, uid} = json.data
              setStorage({skey, uid})
              this.loginSuccess()
            },
            noLogin: json => {
              wx.hideLoading()
              if (json.errno == 3520 && json.data && json.data.openid) {
                userInfo.openid = json.data.openid
                this.setData({showBtn: true})
              } else {
                this.fail('接口异常')
              }
            },
            fail: () => {
              wx.hideLoading()
              this.fail('网络异常')
            },
          })
        },
        fail: () => {
          wx.hideLoading()
          this.fail('微信登录失败')
        },
      })
    } else {
      userInfo.openid = option.openid
      this.setData({showBtn: true})
    }
  },
})
