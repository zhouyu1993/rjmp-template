const {login} = require('../../../common/passport')
// pages/demo/index.js
Page({
  data: {
    city: '',
  },
  bindCenter() {
    wx.navigateTo({url: '/public/pages/common/my/index'})
  },
  bindSelectCity() {
    wx.navigateTo({url: '/public/pages/common/city/index'})
  },
  bindSelectAddress() {
    wx.navigateTo({url: '/public/pages/common/address/index?type=select'})
  },
  bindRegister() {
    wx.navigateTo({url: '/public/pages/common/register/index'})
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
    wx.navigateTo({url: '/sub-pages/pages/coupon-tabs/index'})
  },
  bindCard() {
    wx.navigateTo({url: '/public/pages/common/card/index'})
  },
  bindSelectCoupon() {
    wx.navigateTo({url: '/public/pages/common/selectCoupon/index'})
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
