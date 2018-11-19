/**
 * 券转赠分享
 */

Component({
  properties: {
    show: {
      type: Boolean,
      observer: function(val) {
        if (val) {
          let _this = this
          setTimeout(function() {
            if (_this.error) _this.triggerEvent('error', _this.error)
          }, 0)
        }
      },
    },
    data: {
      type: Object,
      observer: function(valnew = {}, valold = {}) {
        if (
          valnew &&
          valnew.couponId &&
          (!valold || valold.couponId !== valnew.couponId)
        ) {
          this.error = null
          this.setData({
            shareData: null,
          })
          let val = valnew
          let userInfo = wx.getStorageSync('passport')
          wx.request({
            url: `https://miniapp.cekid.com/coupon/coupongive/shareGiveCoupon`,
            data: {...userInfo, source: 2, couponcode: valnew.couponId},
            method: 'GET',
            success: ({data: {errmsg, errno, data}}) => {
              if (errno == 0) {
                let {shareCode} = data
                // let shareCode = 111
                this.setData({
                  shareCode,
                  shareData: {
                    poster: 'canvas',
                    width: 750,
                    height: 1334,
                    path: `/pages/mall-index/index?referer=${encodeURIComponent(
                      '/pages/give-coupon/index?sharecode=' +
                        encodeURIComponent(shareCode),
                    )}`,
                    title: '嘘，悄咪咪送你一张优惠券，赶紧戳开看看！',
                    imageUrl:
                      'https://cmspic-10004025.image.myqcloud.com/9ec5a630-ae9a-11e8-98c4-5107552d084a_size_420x336',
                  },
                })
              } else {
                this.error = {msg: errmsg, code: errno}
                this.triggerEvent('error', this.error)
              }
            },
          })
        } else if (!(valnew && valnew.couponId)) {
          this.error = {msg: '参数有误'}
          this.triggerEvent('error', this.error)
        }
      },
    },
    wrapperClass: {
      type: String,
    },
  },
  data: {
    shareData: null,
    shareCode: null,
  },
  methods: {
    onDraw: function({detail: {ctx, updater}}) {
      let bgPath
      let codePath

      let downloadSuccess = () => {
        if (bgPath && codePath) {
          ctx.drawImage(bgPath, 0, 0, 750, 1334)
          ctx.drawImage(codePath, 520, 1080, 200, 200)
          ctx.draw(false, updater)
        }
      }
      wx.downloadFile({
        url:
          'https://cmspic-10004025.image.myqcloud.com/a4e2f010-ac4f-11e8-94ac-fb701707289b_size_750x1334',
        success: ({tempFilePath}) => {
          bgPath = tempFilePath
          downloadSuccess()
        },
        fail: e => {
          console.log('download fail', e)
        },
      })
      wx.downloadFile({
        url: `https://wxapi.cekid.com/out/hzw_mall/wxa/getwxacodeunlimit?_method=post&_body=${JSON.stringify(
          {
            page: 'pages/give-coupon/index',
            scene: encodeURIComponent(this.data.shareCode),
            width: 170,
          },
        )}`,
        success: res => {
          let {statusCode, tempFilePath} = res
          if (statusCode === 200) {
            codePath = tempFilePath
            downloadSuccess()
          }
        },
        fail: e => {
          console.log('download fail', e)
        },
      })
    },
    onShare: function(e) {
      this.triggerEvent('share', e.detail, {bubbles: true, composed: true})
    },
    onClose: function(e) {
      this.triggerEvent('close', {}, {bubbles: true, composed: true})
    },
  },
})
