import md5 from 'crypto-js/md5'

import { WXDATA } from '../../utils/api'
import { appId } from '../../utils/constants'
import request from '../../utils/request'

Component({
  externalClasses: ['my-class'],
  behaviors: [],
  options: {},
  // https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/relations.html
  relations: {},
  // 类似 vue 中 props
  properties: {
    disabled: {
      type: Boolean,
      value: false,
      observer (newVal, oldVal) {
        // console.log(newVal, oldVal)
      },
    },
  },
  // 类似 vue 中 data
  data: {},
  // 类似 vue 中 methods
  methods: {
    tracker (e) {
      if (this.properties.disabled) return

      const formId = e.detail && e.detail.formId

      if (formId === 'the formId is a mock one') return console.warn(`模拟器操作不上报formid, 合法request里需要配置 ${WXDATA}`)

      wx.login({
        success: ({ code }) => {
          const { uid = '', } = wx.getStorageSync('passport') || {}
          const str = uid ? `${appId}${formId}${code}${uid}hzw365` : `${appId}${formId}${code}hzw365`
          const sign = md5(str)
          console.log(str, sign)

          request({
            url: `${WXDATA}/api/v1/appInfo/saveInfo?app_id=${appId}&form_id=${formId}&code=${code}&uid=${uid}&sign=${sign}`,
            showLoading: false,
            fail: () => {},
            isSuccess: () => true,
            success: () => {},
          })
        },
      })
    },
  },
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
