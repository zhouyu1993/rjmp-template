const parse = string => {
  if (!string || typeof string !== 'string') return {}

  const config = {}

  const arr = string.split('&')
  arr.forEach((item) => {
    const _arr = item.split('=')
    if (_arr.length === 2) {
      config[_arr[0]] = decodeURIComponent(_arr[1])
    }
  })

  return config
}

export {
  parse,
}

export default {
  parse,
}
