import a from './a.js'
import b from './b.js'

export default {
  data: {
    commonA: 'a',
    commonB: 'b',
    pageA: a.data,
    pageB: b.data,
  },
  increase: function (num) {
    a.aMethod(num)
  },
  decrease: function (num) {
    b.bMethod(num)
  },
}
