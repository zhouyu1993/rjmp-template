const pay = require('../../../common/payment')
const {checkLogin} = require('../../../common/passport')
const {webViewUrl} = require('../../../common/util')

const webUrlReg = /^http(s)?:\/\//
Page({
  url(url) {
    let u = decodeURIComponent(url)
    let others = this.otherParams
    u = `${u}${u.indexOf('?') >= 0 ? `&` : `?`}${Object.keys(others)
      .map(k => `${k}=${others[k]}`)
      .join('&')}`
    if (webUrlReg.test(u)) {
      u = webViewUrl(u)
    }
    return u
  },
  onLoad: function(options) {
    let {
      partnerid: partnerId,
      orderId,
      success = './result?success=true',
      fail = './result?success=false',
      ...others
    } = options
    this.options = options
    let passport = checkLogin()
    this.otherParams = others
    let url = this.url
    orderId = decodeURIComponent(orderId)
    partnerId = decodeURIComponent(partnerId)
    Object.assign(others, {orderid: orderId, partnerid: partnerId})
    success = decodeURIComponent(success)
    fail = decodeURIComponent(fail)
    this.successPage = success
    this.failPage = fail
    pay({
      passport,
      orderId,
      partnerId,
      successPage: url(success),
      failPage: url(fail),
      success: () => {
        wx.redirectTo({url: url(success)})
      },
      fail: () => {
        wx.redirectTo({url: url(fail)})
      },
      cancel: () => {
        wx.redirectTo({url: url(fail)})
      },
    })
  },
  onShow() {
    if (this.gotoPay) {
      this.gotoPay = false

      let {uid, skey} = checkLogin()

      let {partnerid, orderId} = this.options
      wx.request({
        url: `https://pay.cekid.com/cashier/cashier_query_new.php?skey=${skey}&uid=${uid}&orderid=${orderId}&platformid=1&partnerid=${partnerid ||
          1}&client=6&ver=404`,
        header: {
          Cookie: `uid=${uid};skey=${skey};_platform_num=1`,
        },
        success: ({data}) => {
          if (data.errno === 4) {
            wx.redirectTo({url: this.url(this.successPage)})
          } else {
            wx.redirectTo({url: this.url(this.failPage)})
          }
        },
        fail: () => {
          wx.redirectTo({url: this.url(this.failPage)})
        },
      })
    }
  },
  onHide() {
    this.gotoPay = true
  },
})
