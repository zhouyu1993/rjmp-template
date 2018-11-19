const fixNumber = (input, multiple = 100, decimal = 2) => {
  input = +input
  multiple = +multiple || 100

  return (input / multiple).toFixed(decimal).replace(/\.?0*$/, '')
}

export default fixNumber
