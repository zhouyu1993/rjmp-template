const {checkLogin} = require('./passport')
const request = require('./request')
function getDetail() {
  return new Promise((res, rej) => {
    let passport = checkLogin()
    if (!passport) {
      rej({msg: 'nologin'})
      return
    }
    let userInfo = wx.getStorageSync('userinfo')
    if (userInfo) {
      res(userInfo)
      return
    }
    request({
      url: `https://user.cekid.com/user/GetUserInfo`,
      data: passport,
      success: response => {
        try {
          let {
            data: {nickname: nickName, photo: avatar},
          } = response
          let info = {nickName, avatar}
          wx.setStorageSync('userinfo', info)
          res(info)
        } catch (e) {
          rej(e)
        }
      },
      fail: () => {
        rej()
      },
      complete: () => {
        rej()
      },
      noLogin: () => {
        rej({msg: 'nologin'})
      },
    })
  })
}
module.exports = {
  getDetail,
}
