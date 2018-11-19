function alert(content) {
  wx.showModal({
    title: '错误提示',
    showCancel: false,
    content,
  })
}

function request(option) {
  const {
    url,
    data,
    header = {
      'content-type': 'application/x-www-form-urlencoded',
    },
    method = 'GET',
    showLoading = true,
    success = () => {},
    fail = () => {},
    complete = () => {},
    isSuccess = () => false,
    noLogin = () => {},
  } = option
  if (
    typeof success !== 'function' ||
    typeof fail !== 'function' ||
    typeof complete !== 'function'
  ) {
    return false
  }
  showLoading && wx.showLoading({title: '加载中'})
  wx.request({
    url,
    data,
    header,
    method,
    success: res => {
      showLoading && wx.hideLoading()
      if (isSuccess(res.data) || res.data.errno == 0) {
        success(res.data)
      } else if (res.data.errno == 1024 || res.data.errno == 3520) {
        // 未登录，或用户不存在
        // toast('用户未登录')
        noLogin(res.data)
      } else if (res.data && typeof res.data.errmsg === 'string') {
        alert(res.data.errmsg)
      } else {
        alert('接口异常')
      }
    },
    fail: err => {
      showLoading && wx.hideLoading()
      fail(err)
    },
    complete,
  })
}

module.exports = request
