import protocol from './protocol'
import imageOptimizer from './imageOptimizer'

/**
 * @name 万像优图+过滤协议+webp
 * @param  { String } src 图片地址，必须是腾讯云
 * @param  { Number, String } width 图片宽
 * @param  { Number, String } height 图片高
 * @param  { String } type 图片类型
 * @param  { Number, String } way 优化方式。0-5是基本图像处理接口；否则是高级图像处理接口，用字符串表示。具体看文档
 * @param  { Number, String } quality 图片质量。默认 85
 */

const imageView = (src = '', width, height, type, way = 1, quality = 85) => {
  try {
    if (typeof src !== 'string') return src
    if (!src) return ''
    src = protocol(src)
    return imageOptimizer(src, width, height, type, way, quality)
  } catch (e) {
    console.log(e)
    return src
  }
}

module.exports = imageView
