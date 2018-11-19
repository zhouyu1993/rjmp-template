/**
 * @name 过滤协议
* @param { String } url [资源地址]
 */

const protocol = url => {
  if (!url || typeof url !== 'string') return ''

  return url.replace(/^http(s?):/, 'https:')
}

export default protocol
