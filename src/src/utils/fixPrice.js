import fixNumber from './fixNumber'

const fixPrice = (input, multiple = 100, decimal = 2, unit = '元', defaultDescribe = '0') => {
  input = +input

  return input ? `${fixNumber(input, multiple, decimal)}${unit}` : defaultDescribe
}

export default fixPrice
