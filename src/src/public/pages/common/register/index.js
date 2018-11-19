//index.js
const {
  API_USER_CONFIRM,
  API_USER_LOGIN,
  API_VC_SEND_CODE,
  API_PICT_CODE,
  API_USER_REGISTER,
} = require('../../../common/api')
const request = require('../../../common/request')
const {appId} = require('../../../common/constants')
const Base64 = require('../../../common/base64')
const { hex_md5 : hexMD5 } = require('../../../common/md5')
const {webViewUrl} = require('../../../common/util')

const app = getApp()
const busId = '102'
const base64 = new Base64()
const identity = base64.encode(Date.now() + busId)
const appCode = base64.encode('user')
const appServiceCode = base64.encode(busId)

// 用户信息存储
const userInfo = {}
function getPictVerifyImage() {
  return `${API_PICT_CODE}?identity=${identity}&appCode=${appCode}&appServiceCode=${appServiceCode}&rand=v-${Date.now()}`
}
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
    mobile: '',
    verifyCode: '',
    pictCode: '',
    codeFetching: false,
    countdown: -1,
    pictCodeUrl: getPictVerifyImage(),
    toast: '',
    weixinReg: true,
    checkAgreement: false,
  },
  showToast: function(toast, duration = 1500) {
    this.setData({toast})
    setTimeout(() => {
      this.setData({toast: ''})
    }, duration)
  },
  validateMobile: function(mobile) {
    mobile = mobile || this.data.mobile
    if (!/1\d{10}/.test(mobile)) {
      this.showToast('请输入正确的手机号')
      return false
    }
    return true
  },
  validateCode: function(verifyCode) {
    verifyCode = verifyCode || this.data.verifyCode
    if (!/\d{6}/.test(verifyCode)) {
      this.showToast('请输入正确的验证码')
      return false
    }
    return true
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
  onTapFakeButton() {
    wx.showToast({
      title: '请先阅读并同意《孩子王服务协议》及《隐私保护政策》哦~',
      icon: 'none',
      duration: 2000,
    })
  },
  bindClearTap: function(e) {
    this.setData({
      [e.target.id]: '',
    })
  },
  bindMobileInput: function(e) {
    this.setData({
      mobile: e.detail.value,
    })
  },
  bindInput: function(e) {
    this.setData({
      [e.target.id]: e.detail.value,
    })
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
  countdownCode: function() {
    if (this.data.countdown == 0) {
      return
    }
    this.setData({countdown: this.data.countdown - 1})
    setTimeout(this.countdownCode, 1000)
  },
  bindPictCodeTap: function() {
    this.setData({
      pictCodeUrl: getPictVerifyImage(),
    })
  },
  // 发送验证码
  bindSendCodeTap: function() {
    if (this.codeFetching) {
      return
    }
    if (!this.validateMobile()) {
      return
    }
    this.setData({codeFetching: true})
    const {mobile, pictCode} = this.data
    request({
      url: `${API_VC_SEND_CODE}?bus_id=${busId}&mobile=${mobile}&pvid=${identity}&pvstr=${pictCode}&appcode=user&tem_id=1001`,
      showLoading: false,
      success: json => {
        // 方便测试环境，自动填写
        if (/\d{6}/.test(json.errmsg)) {
          this.setData({verifyCode: json.errmsg})
        }
        this.setData({countdown: 60})
        this.countdownCode()
      },
      complete: () => this.setData({codeFetching: false}),
    })
  },
  // 提交
  bindSubmitTap: function() {
    if (!this.validateMobile() || !this.validateCode()) {
      return
    }
    // 验证通过，提交注册
    const opt = {
      appid: appId,
      mobile: this.data.mobile,
      verifycode: this.data.verifyCode,
      ...(this.getInviteInfo() || {}),
    }
    request({
      url: API_USER_REGISTER,
      method: 'POST',
      data: {...opt, ...userInfo},
      success: json => {
        wx.showToast({
          title: '注册成功',
          icon: 'success',
        })
        const {skey, uid, isnew} = json.data
        this.onComplete(skey, uid, isnew)
      },
    })
  },

  getUserInfo: function() {
    wx.getUserInfo({
      withCredentials: true,
      success: res => {
        userInfo.iv = res.iv
        userInfo.encryptedData = res.encryptedData
      },
      fail: e => {
        wx.showModal({
          title: '错误提示',
          content: '您未授权成功，请删除小程序再次授权！',
          showCancel: false,
        })
      },
    })
  },

  onPhoneRegTap: function() {
    this.setData({weixinReg: false})
  },

  getInviteInfo() {
    // 如果是扫门店二维码注册，从storage中获取门店fromEntity
    // 如果是扫会员二维码注册，从参数中获取eid,sid
    // 当fromEntity和eid同时存在，只传eid,sid

    try {
      var fromEntity = wx.getStorageSync('fromEntity')
      var regSourceId = wx.getStorageSync('regSourceId')
      var hserecomkey = wx.getStorageSync('hserecomkey')
      var invitecode = wx.getStorageSync('invitecode')
      if (this.eid) { // 扫人客二维码注册
        return {
          invitecode: this.eid,
          creatorDepartment: this.sid || '',
        }
      } else { // 扫门店二维码注册 或 分享注册
        return {
          invitecode: invitecode || hserecomkey || '',
          creatorDepartment: fromEntity || '',
          bus_type: regSourceId || ''
        }
      }
    } catch (e) {
      console.log(e)
    }
  },

  onCheckAgreement() {
    this.setData({
      checkAgreement: !this.data.checkAgreement
    })
  },

  onWeixinRegTap: function(e) {
    let {detail} = e
    let {errMsg} = detail
    if (errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({title: '获取手机号失败', icon: 'none'})
      return
    }
    let encryptedMobile = detail.encryptedData
    let iv4Mobile = detail.iv
    let {openid, encryptedData, iv} = userInfo
    request({
      url: API_USER_REGISTER,
      method: 'POST',
      data: {
        appid: appId,
        openid,
        encryptedData,
        iv,
        encryptedMobile,
        iv4Mobile,
        ...(this.getInviteInfo() || {}),
      },
      success: json => {
        wx.showToast({
          title: '注册成功',
          icon: 'success',
        })
        const {skey, uid, isnew} = json.data
        this.onComplete(skey, uid, isnew)
      },
    })
  },

  onComplete(skey, uid, isnew) {
    wx.setStorage({
      key: 'passport',
      data: {skey, uid},
      success: () => {
        setTimeout(() => {
          if (this.backHome && isnew == 0) {
            wx.reLaunch({url: '/pages/vip-privilege/index'})
          } else {
            // 在storage中增加标记，以区分已注册未授权的用户，供原页面使用
            // 否则返回原页面后不知道是新注册用户，还是已注册未授权的用户
            wx.setStorage({
              key: 'isNewUser',
              data: '1',
              success: () => {
                wx.navigateBack({delta: 1})
              }
            })
          }
        }, 1000)
      }
    })
  },

  fail(title) {
    wx.showToast({
      title, 
      icon: 'none'
    })
  },

  onLoad: function(option) {
    this.eid = option.eid
    this.sid = option.sid
    this.backHome = option.backhome
    if (!option.openid) {
      wx.login({
        success: res => {
          if (!res.code) {
            wx.hideLoading()
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
              setStorage({
                skey,
                uid,
              })
            },
            noLogin: json => {
              if (json.errno == 3520 && json.data && json.data.openid) {
                // 未绑定用户，拿不到unionid
                userInfo.openid = json.data.openid
              } else {
                wx.hideLoading()
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
    }
    this.getUserInfo()
  },
})
