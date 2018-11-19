var barcode = require('./barCode')
var qrcode = require('./qrCode')
function convert_length(length) {
  return Math.round((wx.getSystemInfoSync().windowWidth * length) / 750)
}

function barc(id, code, width, height, ctx) {
  return new Promise((resolve, reject) => {
    const content = wx.createCanvasContext(id, ctx)
    barcode.code128(
      content,
      code,
      convert_length(width),
      convert_length(height),
      () => {
        resolve(content)
      },
    )
  })
}

function qrc(id, code, width, height) {
  qrcode.api.draw(code, {
    ctx: wx.createCanvasContext(id),
    width: convert_length(width),
    height: convert_length(height),
  })
}

function getImage(id, width, height) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width,
      height,
      destWidth: width,
      destHeight: height,
      canvasId: id,
      success: function(res) {
        console.log('success', res)
        resolve(res)
      },
      fail: function(rej) {
        console.log('fail', rej)
        reject(rej)
      },
    })
  })
}

module.exports = {
  barcode: barc,
  qrcode: qrc,
  getImage: getImage,
}
