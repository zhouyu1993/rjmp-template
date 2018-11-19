Page({
  data: {
    tip: null,
    success: null,
  },
  onLoad(options) {
    let {success, orderid, partnerid} = options
    success = JSON.parse(success)
    this.setData({
      tip: success ? '订单支付成功！' : '订单支付失败',
      success,
      orderid,
      partnerid,
    })
  },
})
