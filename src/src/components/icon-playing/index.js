import computedBehavior from '../computedBehavior'

Component({
  externalClasses: ['my-class'],
  behaviors: [computedBehavior],
  options: {},
  // https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/relations.html
  relations: {},
  // 类似 vue 中 props
  properties: {},
  // 类似 vue 中 data
  data: {},
  // 类似 vue 中 computed。计算属性挂在 data 上，当依赖的变量发生 setData 变化时，会重新计算并进行 setData
  computed: {},
  // 类似 vue 中 methods
  methods: {},
  lifetimes: {
    created () {},
    attached () {},
    ready () {},
    moved () {},
    detached () {},
  },
  pageLifetimes: {
    show () {},
    hide () {},
    resize () {},
  },
})
