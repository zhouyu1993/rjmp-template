// components/tab/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      // 属性名
      type: Boolean, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: false,
    },
    ticketstatus: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},
})
