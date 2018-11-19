import store from '../../store'
import create from '../../utils/create'
import navigateTo from '../../utils/navigateTo'

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
      title: 'a',
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
  decrease () {
    this.store.decrease(2)

    this.update()

    navigateTo({
      url: '/pages/b/index',
    })
  },
})
