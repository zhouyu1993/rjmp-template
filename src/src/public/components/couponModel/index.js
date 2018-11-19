// components/tab/index.js
const {webViewUrl} = require('../../common/util')
const TicketApi = require('kwapi/dist_weixin/interface/Ticket').default
const tracker = require('../../common/tracker')
const pageid = 100012

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      // 属性名
      type: Array, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: [],
    },
    canSelect: {
      type: Boolean,
      value: false,
    },
    isSingle: {
      type: Boolean,
      value: false,
    },
    text: {
      type: String,
      value: '',
    },
    tipLable: {
      type: String,
      value: '适用范围',
    },
    /* 1：我的券，2：选择券不可用券 */
    couponType: {
      type: Number,
      value: 1,
    },
    subType: {
      /* 属于哪一种券，god,normal,freight */
      type: String,
      value: '',
    },
    tabIndex: {
      type: Number,
      value: 0,
    },
  },
  data: {
    opacity3: '',
    pic:
      'https://cmspic-10004025.image.myqcloud.com/f2bea910-ab68-11e8-9ff3-7510ec46b388_size_750x1334',
  },
  ready: function() {
    const {couponType} = this.data
    if (couponType == 2) {
      this.setData({
        opacity3: 'opacity3',
      })
    }
  },
  methods: {
    bindShowMore(e) {
      const {couponType} = this.data
      if (couponType == 1) {
        const {tabIndex, data} = this.data
        let newList = null
        this.setData({
          data: this.setDataList(data, e.currentTarget.dataset.index),
        })
      } else {
        this.handleShowDetail(e)
      }
    },
    // 每一行选择券时
    bindSelectCoupon(e) {
      let {code} = e.currentTarget.dataset
      const {tabIndex} = this.data
      wx.navigateTo({
        url: `/sub-pages/pages/ticket-detail/index?code=${code}`,
      })
      // const {canSelect, isSingle, data, subType} = this.data
      // const {index} = e.currentTarget.dataset
      // if (canSelect) {
      //   let tempData = null
      //   tempData = data.map((item, currentIndex) => {
      //     if (isSingle && index != currentIndex) {
      //       item.Selected = 0
      //     }
      //     if (index == currentIndex) {
      //       item.Selected = !item.Selected
      //     }
      //     return item
      //   })
      //   this.setData({
      //     data: tempData,
      //   })
      //   this.triggerEvent('setselectedcoupon', {
      //     coupons: tempData,
      //     subType: subType,
      //   })
      // }
    },
    // 把当前的类型和索引传给父组件，通过父组件去读取
    handleShowDetail(e) {
      const {subType} = this.data
      this.triggerEvent('showdetail', {
        index: e.currentTarget.dataset.index,
        subType: subType,
      })
    },

    tracker(params) {
      tracker(params)
    },
    // 点击去使用券
    useTicket(e) {
      const {id, range, urls} = e.currentTarget.dataset
      let {tabIndex} = this.data
      tracker(`20000|${pageid}|200117|${tabIndex}`)
      if (tabIndex == 0) {
        if (range == 0) {
          wx.switchTab({
            url: '/pages/mall-index/index',
          })
        } else {
          wx.navigateTo({
            url: `/sub-pages/pages/search/mall/result?couponid=${id}`,
          })
        }
      } else if (tabIndex == 1) {
        wx.switchTab({
          url: '/pages/store-index/index',
        })
      } else {
        wx.switchTab({
          url: '/pages/mall-index/index',
        })
      }
    },
    // 点击转赠券按钮
    shareTicket(e) {
      tracker(`20000|${pageid}|200116`)
      let {code, state} = e.currentTarget.dataset
      this.triggerEvent('give', {couponId: code})
    },
  },
})
