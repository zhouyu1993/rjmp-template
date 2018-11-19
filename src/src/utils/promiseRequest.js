import alert from './alert'

const request = (option) => {
  const {
    url,
    data,
    header = {
      'content-type': 'application/x-www-form-urlencoded',
    },
    method = 'GET',
    dataType = 'json',
    responseType = 'text',
    showLoading = true,
    fail = res => {
      alert('网络异常')
    },
    complete = () => {},
    isSuccess = data => false,
    isNoLogin = data => false,
    noLogin = data => {
      alert((data && (data.message || data.errmsg || data.msg)) || '未登录')
    },
    error = data => {
      alert((data && (data.message || data.errmsg || data.msg)) || '接口异常')
    },
  } = option

  if (typeof fail !== 'function' || typeof complete !== 'function' || typeof isSuccess !== 'function' || typeof isNoLogin !== 'function' || typeof noLogin !== 'function' || typeof error !== 'function') return alert('参数错误')

  showLoading && wx.showLoading({ title: '加载中', })

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      header,
      method,
      dataType,
      responseType,
      success: ({ data, }) => {
        showLoading && wx.hideLoading()

        if (isSuccess(data) || data.code === 1001 || data.errno === 0) {
          resolve(data)
        } else {
          reject(data)
        }
      },
      fail: res => {
        showLoading && wx.hideLoading()

        fail(res)

        reject(res)
      },
      complete,
    })
  }).catch(data => {
    if (isNoLogin(data) || data.code === 1024 || data.errno === 3520) {
      noLogin(data)
    } else {
      throw data
    }
  })
}

export default request
