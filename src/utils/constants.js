const appId = '{{app_id}}'
const appSecret = '{{app_secret}}'

const version = '1.0.0'

if (wx.setStorageSync) {
  wx.setStorageSync('appConfig', {
    appId,
    version,
  })
}

export {
  appId,
  appSecret,
  version,
}
