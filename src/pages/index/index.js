import { getHotKey } from '../../utils/actions'
import { CYQQ } from '../../utils/api'
import request from '../../utils/request'

Page({
  data: {
    hotkeys: [],
  },
  onLoad (options) {
    console.log(`Page.onLoad`, options)
  },
  onShow () {
    this.getHotKeyAsync()

    // this.getHotKey()
  },
  onShareAppMessage (options) {
    return {
      title: '{{name}}',
      path: '/pages/index/index',
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
      },
    }
  },
  async getHotKeyAsync () {
    try {
      const res = await getHotKey()

      const data = res.data || {}
      const hotkeys = data.hotkey || []
      const special_key = data.special_key || ''

      if (special_key) {
        hotkeys.unshift({
          k: special_key,
          n: 0,
        })
      }

      if (hotkeys.length) {
        this.setData({
          hotkeys,
        })
      }
    } catch (e) {
      console.log(e)
    }
  },
  getHotKey () {
    request({
      url: `${CYQQ}/splcloud/fcgi-bin/gethotkey.fcg?gformat=json`,
      showLoading: false,
      fail: () => {},
      isSuccess: res => res.code === 0,
      success: res => {
        const data = res.data || {}
        const hotkeys = data.hotkey || []
        const special_key = data.special_key || ''

        if (special_key) {
          hotkeys.unshift({
            k: special_key,
            n: 0,
          })
        }

        if (hotkeys.length) {
          this.setData({
            hotkeys,
          })
        }
      },
    })
  },
})
