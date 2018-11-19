const {API_USER_LOGIN, API_USER_REGISTER} = require('./api')
const {appId} = require('./constants')
const request = require('./request')

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

// 取unionid再次登录
function loginWithUnionid(success = () => {}, fail, openid) {
  wx.getUserInfo({
    withCredentials: true,
    success: res => {
      const {encryptedData, iv} = res
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
          setStorage({skey, uid}, success)
        },
        noLogin: () => {
          // 未注册
          wx.navigateTo({
            url: `/public/pages/common/register/index?openid=${openid}`,
          })
          fail('用户未注册')
        },
        fail: () => {
          fail('网络异常')
        },
        complete: () => {
          wx.hideLoading()
        },
      })
    },
    fail: e => {
      console.log(e)
      wx.hideLoading()
      wx.navigateTo({
        url: `/public/pages/common/login/index?openid=${openid}`,
      })
      // wx.showModal({
      //   title: '错误提示',
      //   content: '您未授权成功，请删除小程序再次授权！',
      //   showCancel: false,
      // })
    },
  })
}

// 用户登录
function login(success = () => {}, fail = () => {}, forceBind = true) {
  wx.showLoading({title: '登录中'})
  wx.login({
    success: res => {
      if (!res.code) {
        wx.hideLoading()
        fail('获取微信登录失败')
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
          setStorage({skey, uid}, success)
        },
        noLogin: json => {
          if (json.errno == 3520 && json.data && json.data.openid) {
            if (forceBind) {
              // 未绑定用户，拿不到unionid
              wx.navigateTo({
                url: `/public/pages/common/login/index?openid=${
                  json.data.openid
                }`,
              })
            } else {
              wx.hideLoading()
              fail({
                type: 'UNBINDUSER',
                msg: '未绑定用户',
                openId: json.data.openid,
              })
            }
          } else {
            wx.hideLoading()
            fail('接口异常')
          }
        },
        fail: () => {
          wx.hideLoading()
          fail('网络异常')
        },
      })
    },
    fail: () => {
      wx.hideLoading()
      fail('微信登录失败')
    },
  })
}
function loginWithData({
  encryptedData,
  iv,
  openId: openid,
  success = () => {},
  fail = () => {},
  regParams = {},
}) {
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
      success()
    },
    noLogin: () => {
      // 未注册
      let params = Object.keys(regParams)
        .map(key => `${key}=${regParams[key]}`)
        .join('&')
      wx.navigateTo({
        url: `/public/pages/common/register/index${params ? `?${params}` : ''}`,
      })
      wx.showToast({title: '授权成功，建议使用微信登录', icon: 'none'})
    },
    fail: () => {
      wx.showToast({title: '网络异常', icon: 'none'})
    },
    complete: () => {
      fail()
    },
  })
}
// 确认登录态
function checkLogin() {
  try {
    const passport = wx.getStorageSync('passport')
    if (passport && passport.uid && passport.skey) {
      return passport
    }
  } catch (e) {}
  return false
}
function logOut() {
  wx.removeStorageSync('passport')
}

module.exports = {
  login,
  checkLogin,
  loginWithData,
  logOut,
}
