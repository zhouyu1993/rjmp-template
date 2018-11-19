const {login} = require('../../../common/passport')
// pages/demo/index.js
Page({
  data: {
    city: '',
  },
  bindCenter() {
    wx.navigateTo({url: '/pages/common/my/index'})
  },
  bindSelectCity() {
    wx.navigateTo({url: '/pages/common/city/index'})
  },
  bindSelectAddress() {
    wx.navigateTo({url: '/pages/common/address/index'})
  },
  bindRegister() {
    wx.navigateTo({url: '/pages/common/register/index'})
  },
  bindSelectCoupon() {
    wx.navigateTo({
      url:
        '/pages/common/selectCoupon/index?entityid=8002&items=998203|1|12900|12900|3|303895|1|84010101|0068|8400998203|1|500|1',
    })
  },
  bindScanPay() {
    wx.navigateTo({url: '/pages/common/scancodePay/index'})
  },
  bindLogin() {
    login(
      () => {
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000,
        })
      },
      msg => {
        wx.showToast({
          title: msg,
          icon: 'success',
          duration: 2000,
        })
      },
    )
  },
  bindCoupon() {
    console.log(111)
    wx.navigateTo({url: '/sub-pages/pages/coupon-tabs/index'})
  },
  bindCard() {
    wx.navigateTo({url: '/pages/common/card/index'})
  },
  onShow() {
    wx.getStorage({
      key: 'historyCity',
      complete: res => {
        if (res.data) {
          try {
            const history = JSON.parse(res.data)
            history[0] &&
              this.setData({
                city: history[0].name,
              })
          } catch (error) {
            console.log(error)
          }
        }
      },
    })
  },
})
