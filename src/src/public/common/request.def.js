// option
// {
//   url: 'https://user.cekid.com/login',
//   method: 'POST',
//   data: { x: '', y: '' },
//   showLoading: false,  默认true
// }
function request(option = {}) {
  if (option.showLoading !== false) {
    wx.showLoading({ title: '加载中' })
  }
  return new Promise((resolve, reject) => {
    const result = {
      success: res => {
        if (res.statusCode == 200 && res.data) {
          if (res.data.errno == 0 && res.data.data) {
            resolve(res.data.data)
          } else {
            reject(res.data.data.errmsg || '服务异常！')
          }
        } else {
          reject('服务异常！')
        }
      },
      fail: () => {
        reject('网络异常！')
      },
      complete: () => {
        if (option.showLoading !== false) {
          wx.hideLoading()
        }
      }
    }
    wx.request(Object.assign({}, option, result))
  })
}

module.exports = request