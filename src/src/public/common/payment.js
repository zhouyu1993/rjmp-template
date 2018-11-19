const paymentURL = 'https://pay.cekid.com/cashier/cashier_request.php'
const request = require('./request')
const {login} = require('./passport')
const {appId} = require('./constants')
let cashierConfig
function enabledCashier(callback) {
  if (cashierConfig) {
    callback(enabled)
  } else {
    wx.request({
      url: 'https://cms.cekid.com/publish/980/minicashier.json',
      success: ({data: {data}}) => callback(data.enabled),
      fail: () => callback(false),
    })
  }
}
function paymentWithoutLogin(option) {
  login(passport => {
    payment({...option, passport})
  })
}
// 微信支付
// { passport, orderId, partnerId, success, fail, cancel }
function payment(option) {
  const {
    passport,
    orderId,
    payCode = '',
    partnerId = 1,
    successPage,
    failPage,
    success = () => {},
    fail = () => {},
    cancel = () => {},
  } = option

  if (!passport || !passport.uid || !passport.skey) {
    return paymentWithoutLogin(option)
  }
  enabledCashier(enabled => {
    if (enabled) {
      wx.navigateTo({
        url: `/sub-pages/pages/cashier/cashier?payCode=${payCode}&orderid=${orderId}&partnerid=${partnerId}${
          typeof successPage !== 'undefined'
            ? `&successPage=${encodeURIComponent(successPage)}`
            : ''
        }${
          typeof failPage !== 'undefined'
            ? `&failPage=${encodeURIComponent(failPage)}`
            : ''
        }`,
      })
    } else {
      request({
        url: `${paymentURL}?orderid=${orderId}&partnerid=${partnerId}&platformid=1&paytype=1&client=6&appid=${appId}`,
        method: 'POST',
        data: passport,
        success: json => {
          // const { timeStamp, nonceStr, package, paySign } = json.data
          wx.requestPayment({
            ...json.data,
            success,
            fail: obj => {
              if (obj && obj.errMsg == 'requestPayment:fail cancel') {
                cancel(obj)
              } else {
                fail(obj)
              }
            },
          })
        },
        noLogin: () => paymentWithoutLogin(option),
        fail: () => {},
      })
    }
  })
  // return
}

module.exports = payment
