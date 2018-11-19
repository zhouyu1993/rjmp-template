import md5 from 'crypto-js/md5'
import { Base64 } from 'js-base64'
import queryString, { parse, stringify, } from 'query-string'

const app = getApp()

Page({
  data: {
    systemInfo: {},
    userInfo: {},
    address: {},
    modal: {},
  },
  onLoad (options) {
    console.log(`Page.onLoad`, options)
    console.log(Base64)
    console.log(Base64.encode('你好'))
    console.log(Base64.decode('5L2g5aW9'))
    console.log(md5('12345'))
    console.log(queryString)
    console.log(parse('a=1&b=2'))
    console.log(stringify({ a: 1, b: 2 }))

    const { systemInfo, userInfo, address, } = app.globalData

    this.setData({
      systemInfo,
      userInfo,
      address,
    })
  },
  onShow () {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo
          wx.getUserInfo({
            lang: this.data.systemInfo.language || 'en',
            success: res => {
              const { userInfo, } = res

              if (userInfo) {
                this.setData({
                  userInfo,
                })

                app.globalData.userInfo = userInfo
              }
            },
          })
        } else {
          this.showModal({
            content: '登录',
            confirmOpenType: 'getUserInfo',
          })
        }
      }
    })
  },
  onShareAppMessage (options) {
    return {
      title: 'kf-mp2',
      path: '/pages/tool/index',
      success: res => {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
        })
      },
      fail: res => {
        wx.showToast({
          title: '取消分享',
          icon: 'none',
        })
      }
    }
  },
  getUserInfo (res) {
    const { userInfo, } = res.detail

    if (userInfo) {
      this.setData({
        userInfo,
      })

      app.globalData.userInfo = userInfo

      this.hideModal()
    } else {
      wx.getSetting({
        success: res => {
          if (!res.authSetting['scope.userInfo']) {
            wx.showToast({
              title: '未授权无法获取您的信息呦～',
              icon: 'none',
            })
          }
        },
      })
    }
  },
  chooseAddress () {
    wx.chooseAddress({
      success: res => {
        if (res) {
          this.setData({
            address: res,
          })

          app.globalData.address = res
        }
      },
      fail: res => {
        wx.getSetting({
          success: res => {
            if (!res.authSetting['scope.address']) {
              wx.showToast({
                title: '未授权无法获取您的地址呦～',
                icon: 'none',
              })
            }
          },
        })
      },
    })
  },
  clearStorage () {
    wx.showModal({
      title: '提示',
      content: '清除缓存',
      success: res => {
        if (res.confirm) {
          // 清理本地数据缓存
          try {
            wx.clearStorageSync()
          } catch (e) {
            console.log(e)
          }
        }
      }
    })
  },
  showModal (options = {}) {
    this.setData({
      modal: {
        visible: true,
        ...options,
      },
    })
  },
  hideModal () {
    this.setData({
      modal: {
        visible: false,
      },
    })
  },
  modalCancel () {
    wx.showToast({
      title: '不登录无法获取头像呦～',
      icon: 'none',
    })
  },
})
