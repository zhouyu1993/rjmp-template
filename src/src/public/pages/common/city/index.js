const api = require('../../../common/api')
const request = require('../../../common/request')

Page({
  data: {
    letters: [], // 字母列表
    currentLetter: '', // 当前是哪个字母
    cityMap: {}, // 城市列表
    history: [], // 历史城市列表
    hotCity: [{ id: '320100', name: '南京' }, { id: '310000', name: '上海' }], // 热门城市
    ratio: 2 // 设备像素比
  },
  // 点击右边的字母列
  bindRightLetterClick: function (event) {
    const letter = event.currentTarget.dataset.letter
    if (this.data.currentLetter != letter) {
      this.setData({
        currentLetter: letter
      })
    }
  },
  // 点击城市
  bindCityClick: function (e) {
    const { history } = this.data
    const { id, name } = e.currentTarget.dataset
    const idx = history.findIndex(data => data.id == id)
    if (idx !== -1) {
      history.splice(idx, 1)
    }
    history.unshift({ id, name, timestamp: Date.now() })
    history.length > 6 && history.pop()
    wx.setStorage({
      key: 'historyCity',
      data: JSON.stringify(this.data.history),
      success: () => {
        wx.navigateBack({ delta: 1 })       
      }
    })
  },
  // 手指移动时
  bindLetterTouchMove(event) {
    const { history, ratio } = this.data
    const focus = event.touches[0].clientY, index = Math.floor((focus * ratio - 150) / 36)
    let calucatedLetter = ''
    if (index == 0) {
      calucatedLetter = 'hot'
    } else if (index == 1 && history.length > 0) {
      calucatedLetter = 'history'
    } else if (index > 1 && history.length > 0) {
      calucatedLetter = this.data.letters[index - 2]
    } else if (index >= 1) {
      calucatedLetter = this.data.letters[index - 1]
    }
    if (calucatedLetter && this.data.currentLetter !== calucatedLetter) {
      this.setData({
        currentLetter: calucatedLetter
      })
    }
  },
  onLoad: function (options) {
    // 获取屏幕高度，设置字母的高度，字母距离顶部的高度，scrollView的高度
    wx.getSystemInfo({
      success: sys => {
        this.setData({
          ratio: sys.pixelRatio,
           height: sys.screenHeight,
          // letterHeight: Math.round(sys.screenHeight / 32),
          // offsetTop: sys.screenHeight / 13
        })
      }
    })
    // 获取历史
    wx.getStorage({
      key: 'historyCity',
      complete: res => {
        if (res.data) {
          try {
            const history = JSON.parse(res.data)
            this.setData({ history })
          } catch (error) {
            console.log(error)
          }
        }
      }
    })

    // 请求数据
    request({
      url: api.API_GET_CITY,
      isSuccess: data => !!data.data,
      success: json => {
        const tempData = json.data.sort((ele1, ele2) =>
          ele1.PINYIN.localeCompare(ele2.PINYIN)
        )
        const letters = [], cityMap = {}
        tempData.forEach((ele, idx) => {
          const capital = ele.PINYIN.charAt(0)
          if (!cityMap[capital]) {
            cityMap[capital] = []
            letters.push(capital)
          }
          cityMap[capital].push({ id: ele.ID, name: ele.NAME })
        })
        this.setData({ letters, cityMap })
      },
    })
  },
  onUnload() {
    if (!this.data.history || !this.data.history.length) {
      this.data.history = [{
        id: "320100", 
        name:"南京", 
        timestamp: Date.now()
      }];
    }
    wx.setStorage({
      key: 'historyCity',
      data: JSON.stringify(this.data.history)
    })
  }
})