Component({
  properties: {
    show: {
      type: Boolean,
      observer: function(val) {
        if (val) {
          this.checkShowPoster()
        }
      },
    },
    title: {
      type: String,
      value: '分享到好友',
    },
    posterSaveTip: {
      type: String,
      value: '保存图片分享吧',
    },
    type: {
      type: Number,
      value: 1,
      observer: function(val) {
        this.setData({step: val})
        if (val === 2) {
          this.checkShowPoster()
        }
      },
    },
    data: {
      type: Object,
      observer: function(val) {
        if (val && val.poster) {
          if (val.poster === 'canvas') {
            let {width = 482, height = 674} = val
            let posterSize = getPosterSize({width, height})
            this.setData({
              posterType: 'canvas',
              ...posterSize,
              width,
              height,
            })
          } else if (typeof val.poster === 'string') {
            this.setData({posterType: 'image'})
          }
        }
      },
    },
  },
  data: {
    posterWidth: 1,
    posterHeight: 1,
    posterType: undefined,
    canvasTempFile: null,
    step: 1,
    drawing: false,
    drawError: false,
  },
  externalClasses: ['wrapper-class'],
  methods: {
    onCloseTap() {
      this.triggerEvent('close', {}, {bubbles: true, composed: true})
      this.setData({step: this.data.type, canvasTempFile: null})
    },
    onShareFriends() {
      let {path, imageUrl, title} = this.data.data
      this.triggerEvent(
        'share',
        {
          path,
          imageUrl,
          title,
        },
        {bubbles: true, composed: true},
      )
    },
    onImageLoad({detail: {width, height}}) {
      this.setData({
        ...getPosterSize({width, height}),
      })
    },
    onTimelineTap() {
      this.showPoster()
    },
    updatePoster(err) {
      console.log('update', err)
      this.setData({drawing: false})
      if (!(err.errMsg && err.errMsg === 'drawCanvas:ok')) {
        this.setData({drawError: (err.errMsg && err.errMsg) || '图片生成失败'})
        return
      }
      wx.canvasToTempFilePath(
        {
          x: 0,
          y: 0,
          width: this.data.width || this.data.posterWidth,
          height: this.data.height || this.data.posterHeight,
          destWidth: this.data.width || this.data.posterWidth * 2,
          destHeight: this.data.height || this.data.posterHeight * 2,
          canvasId: 'sharePosterCanvas',
          fileType: 'jpg',
          success: ({tempFilePath}) => {
            this.setData({canvasTempFile: tempFilePath})
          },
        },
        this,
      )
    },
    onSaveTap() {
      if (this.data.canvasTempFile) {
        wx.saveImageToPhotosAlbum({
          filePath: this.data.canvasTempFile,
          success() {
            wx.showToast({title: '已保存到手机相册', icon: 'none'})
          },
          fail({errMsg}) {
            if (errMsg.indexOf('cancel') >= 0) {
              wx.showToast({title: '您取消了保存图片', icon: 'none'})
            }
          },
        })
      }
    },
    stopBubble() {},
    checkShowPoster() {
      if (this.data.show && this.data.type === 2) {
        this.showPoster()
      }
    },
    showPoster() {
      this.setData({step: 2, drawing: true}, () => {
        let ctx = wx.createCanvasContext('sharePosterCanvas', this)
        this.setData({drawError: false})
        this.triggerEvent('draw', {
          ctx,
          updater: this.updatePoster.bind(this),
        })
      })
    },
  },
})
function getPosterSize({width, height}) {
  let ratioX = 482 / width
  let ratioY = 674 / height
  let ratio = Math.min(ratioX, ratioY, 1)
  return {
    posterWidth: ~~(width * ratio),
    posterHeight: ~~(height * ratio),
  }
}
