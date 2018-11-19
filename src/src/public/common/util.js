// const { API_USER_LOGIN } = require('./api')
// const { appId } = require('./constants')

const api = require('./api')
const request = require('./request')
const {checkLogin, login} = require('./passport')

function toast(message) {
  wx.showToast({title: message, image: '/assets/warning.png'})
}
// 未登录获取默认地址
function getDefaultAddressWithoutPassport(callback) {
  login(passport => getDefaultAddress(callback, passport))
}

// 获取默认地址
function getDefaultAddress(callback, passport) {
  passport = passport || checkLogin()
  if (!passport || !passport.uid || !passport.skey) {
    return getDefaultAddressWithoutPassport(callback)
  }
  // 请求数据
  request({
    url: api.API_GET_DEFAULT_ADDRESS,
    showLoading: false,
    data: {
      addrtype: '0',
      uid: passport.uid,
      skey: passport.skey,
    },
    success: json => {
      callback && callback(json)
    },
    noLogin: () => getDefaultAddressWithoutPassport(callback),
  })
}
// 登录接口
// function login(successCallback = () => {}, failCallback = () => {}) {
//   wx.showLoading({ title: '加载中' })
//   wx.login({
//     success: function(res) {
//       if (res.code) {
//         // 发起登录请求
//         wx.request({
//           url: API_USER_LOGIN,
//           data: {
//             code: res.code,
//             appid: appId
//           },
//           success: res => {
//             wx.hideLoading()
//             const json = res.data
//             if (json.errno == 0) {
//               const { skey, uid } = json.data
//               wx.setStorage({
//                 key: 'passport',
//                 data: {
//                   skey, uid
//                 },
//                 success: () => {
//                   successCallback({ skey, uid })
//                 }
//               })
//             } else if (json.errno == 3520) {
//               // 未注册
//               wx.navigateTo({ url:`/pages/register/index?openid=${json.data.openid}` })
//             } else {
//               failCallback(json.errmsg || '服务异常')
//             }
//           },
//           fail: () => {
//             wx.hideLoading()
//             failCallback('网络异常')
//           },
//           complete: () => {
//             wx.hideLoading()
//           }
//         })
//       } else {
//         wx.hideLoading()
//         failCallback('微信登录失败')
//       }
//     }
//   })
// }

// // 获取登录态
// function getPassport() {
//   try {
//     const passport = wx.getStorageSync('passport')
//     if (passport && passport.uid && passport.skey) {
//       return passport
//     }
//   } catch (e) {
//     // Do something when catch error
//   }
//   return false
// }

function formatDate(number, split = '.') {
  var n = number * 1000
  var date = new Date(n)
  var Y = date.getFullYear() + split
  var M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + split
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  return Y + M + D
}

function webViewUrl(url, cookies = {}) {
  let host = url.indexOf('czj100.com') !== -1 ? 'app.czj100.com' : 'w.cekid.com'
  return `/pages/webview/index?url=${encodeURIComponent(
    `https://${host}/webridge.html?url=${encodeURIComponent(
      url,
    )}&${Object.keys(cookies)
      .map(key => key + '=' + encodeURIComponent(cookies[key]))
      .join('&')}`,
  )}`
}
function transUrl(url) {
  if (/^http(s)?:\/\//i.test(url)) {
    return webViewUrl(url)
  } else {
    return url
  }
}
module.exports = {
  toast,
  formatDate,
  getDefaultAddressWithoutPassport,
  getDefaultAddress,
  webViewUrl,
  transUrl,
}
