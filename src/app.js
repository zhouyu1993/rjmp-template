import queryString from 'query-string'

import './lib/ald/ald-stat'

import { appId, version } from './utils/constants'

App({
  globalData: {
    path: '',
    query: {},
    referrerInfo: {},
    scene: '',
    shareTicket: '',
    systemInfo: {},
    userInfo: {},
    address: {},
    passport: {},
  },
  onLaunch (options) {
    try {
      if (wx.getSystemInfoSync) {
        const systemInfo = wx.getSystemInfoSync() || {}

        this.globalData.systemInfo = systemInfo
      }

      if (wx.setStorageSync) {
        wx.setStorageSync('appConfig', {
          appId,
          version,
        })
      }
    } catch (e) {
      console.log(e)
    }
  },
  onShow (options) {
    try {
      const { path, query = {}, referrerInfo = {}, scene, shareTicket, } = options || {}

      this.globalData.path = path || ''
      this.globalData.query = query || {}
      this.globalData.referrerInfo = referrerInfo || {}
      this.globalData.scene = scene || ''
      this.globalData.shareTicket = shareTicket || ''

      // 获取传入的登录态
      const { uid, skey, } = (referrerInfo && referrerInfo.extraData) || {}
      if (uid && skey) {
        this.globalData.passport = {
          uid,
          skey,
        }

        wx.setStorageSync('passport', {
          uid,
          skey,
        })
      } else {
        // 获取 storage 中的登录态
        const passport = wx.getStorageSync('passport') || {}

        this.globalData.passport = passport
      }

      const queryScene = query.scene || ''
      if ([1011, 1012, 1013].indexOf(+scene) > -1 && queryScene) {
        // 1011 扫描二维码；1012 长按图片识别二维码；1013 手机相册选取二维码 并且携带参数
        // 1047 扫描小程序码；1048 长按图片识别小程序码；1049 手机相册选取小程序码 并且携带参数
        const query = queryString.parse(decodeURIComponent(queryScene))

        this.globalData.query = query || {}
      }

      this.getUpdateManager()

      if (this.globalData.query.debug) {
        this.setEnableDebug()
      }

      console.log(`App.onShow[${version}]`, options, this.globalData)
    } catch (e) {
      console.log(e)
    }
  },
  onHide () {
    console.log('App.onHide')
  },
  onError (error) {
    console.log('App.onError', error)
  },
  onPageNotFound (options) {
    console.log('App.onPageNotFound', options)

    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  getUpdateManager () {
    try {
      // https://developers.weixin.qq.com/miniprogram/dev/api/getUpdateManager.html
      if (wx.getUpdateManager) {
        const updateManager = wx.getUpdateManager()

        updateManager.onCheckForUpdate(res => {
          // 请求完新版本的信息回调
          if (res.hasUpdate) {
            console.log('onCheckForUpdate:', res)
          }
        })

        updateManager.onUpdateReady(() => {
          // 新版本下载成功
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success (res) {
              if (res.confirm) {
                // 清理本地数据缓存
                try {
                  wx.clearStorageSync()
                } catch (e) {
                  console.log(e)
                }

                // 调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            },
          })
        })

        updateManager.onUpdateFailed(res => {
          // 新版本下载失败
          console.log('onUpdateFailed:', res)
        })
      }
    } catch (e) {
      console.log(e)
    }
  },
  setEnableDebug () {
    try {
      // https://developers.weixin.qq.com/miniprogram/dev/api/setEnableDebug.html
      if (wx.setEnableDebug) {
        wx.setEnableDebug({
          enableDebug: true,
        })
      }
    } catch (e) {
      console.log(e)
    }
  },
})
