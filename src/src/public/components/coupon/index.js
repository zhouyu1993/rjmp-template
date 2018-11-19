// components/tab/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: { // 属性名
      type: Array, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: []
    },
    canSelect: {
      type: Boolean,
      value: false
    },
    isSingle: {
      type: Boolean,
      value: false
    },
    text: {
      type: String,
      value: ''
    },
    tipLable: {
      type: String,
      value: '适用范围'
    },
    /*1：我的券，2：选择券不可用券*/
    couponType:{
      type: Number,
      value:1
    }, 
    subType:{ /*属于哪一种券，god,normal,freight*/
      type: String,
      value: ''
    }
  },
  data:{
    selectedStatusImg: 'https://cmspic-10004025.image.myqcloud.com/913feca3-feff-4227-adb6-bb4b44bf4066',
    unSelectedStatusImg: 'https://cmspic-10004025.image.myqcloud.com/35464693-4d45-4124-838e-2e20bf21f51d',
    opacity3: ''
  },
  ready:function(){
    const { couponType } = this.data
    if(couponType == 2) {
      this.setData({
        opacity3: 'opacity3'
      })
    }
  },
  methods: {
    bindShowMore(e) {
      const { couponType } = this.data
      if(couponType == 1) {
        const { tabIndex, data } = this.data
        let newList = null
        this.setData({
          data: this.setDataList(data, e.currentTarget.dataset.index)
        })
      } else {
        this.handleShowDetail(e)
      }

    },
    // 每一行选择券时
    bindSelectCoupon(e){
      const { canSelect, isSingle, data, subType } = this.data
      const { index } = e.currentTarget.dataset
      if (canSelect) {
        let tempData = null
        tempData =  data.map((item, currentIndex) => {
          if (isSingle && index != currentIndex) {
            item.Selected = 0
          }
          if (index == currentIndex) {
            item.Selected = !item.Selected
          }
          return item
        })
        this.setData({
          data: tempData
        })
        this.triggerEvent('setselectedcoupon', { coupons: tempData, subType: subType}) 
      }
    },
    // 显示更多时，把当前的显示状态置反
    setDataList(coupons, currentIndex) {
      return coupons.map((item, index) => {
        if (currentIndex == index) {
          item.isShow = !item.isShow
        }
        return item
      })
    },
    // 把当前的类型和索引传给父组件，通过父组件去读取
    handleShowDetail(e){
      const { subType } = this.data
      this.triggerEvent('showdetail', { index: e.currentTarget.dataset.index, subType: subType})
    }
  }
})
