const tracker = require('../../common/tracker')
const pageid = 100012
// components/tab/index.js
Component({
  /**
   * 组件的属性列表
   */
  externalClasses: ['wrapper-class', 'item-class'],
  properties: {
    tabs: {
      // 属性名
      type: Array, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: ['tab1', 'tab2'], // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function(newVal, oldVal) {}, // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
    tabIndex: {
      type: Number,
      value: 0,
    },
    trackStatus: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    tracker(params) {
      tracker(params)
    },
    handleTabChange(e) {
      this.setData({
        tabIndex: e.currentTarget.dataset.index,
      })
      this.triggerEvent('tabchange', {tabIndex: e.currentTarget.dataset.index})
      let tabindex = e.currentTarget.dataset.index
      if (this.data.trackStatus) tracker(`20000|${pageid}|200113|${tabindex}`)
    },
  },
})
