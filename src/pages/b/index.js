import store from '../../store'
import create from '../../utils/create'

create(store, {
  data: {
    pageA: {},
    pageB: {},
  },
  onLoad (options) {
  },
  onShow () {
    console.log(this)
  },
  onShareAppMessage (options) {
    return {
      title: 'b',
      path: '/pages/a/index',
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
  increase () {
    this.store.increase(2)

    this.update()

    wx.navigateBack()
  },
})
