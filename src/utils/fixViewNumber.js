const fixViewNumber = (input, multiple = 10000, unit = '万') => {
  input = +input

  return input < 10000 ? `${input}` : `${Math.floor(input / multiple * 100) / 100}${unit}`
}

export default fixViewNumber
