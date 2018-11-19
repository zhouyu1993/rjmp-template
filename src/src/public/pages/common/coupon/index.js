// index.js
Page({
  onLoad(options) {
    if (options.tab) {
      wx.redirectTo({
        url: `/sub-pages/pages/coupon-tabs/index?tab=${options.tab}`,
      })
    } else {
      wx.redirectTo({
        url: '/sub-pages/pages/coupon-tabs/index',
      })
    }
  },
})
