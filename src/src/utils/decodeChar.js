const decodeChar = input => {
  if (!input || typeof input !== 'string') return input

  const output = input.replace(/&#{1}[0-9]{1,};{1}/ig, (v) => {
    const code = v.replace(/&#(.*);/, '$1')
    return String.fromCodePoint(code)
  })

  return output
}

export default decodeChar
