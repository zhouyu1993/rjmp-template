/**
 *
 */
const {
  saveStoreStorageAndReturn,
  saveCityStorage,
  transformCoordinate,
} = require('../../../common/location')

const debounce = require('../../../common/debounce')
const {webViewUrl} = require('../../../common/util')

Page({
  data: {
    city: null,
    storeList: null,
    activeStore: null,
    location: null,
    points: [],
    markers: [],
    focusStore: null,
    mapControls: [],
  },
  getStorageCity() {
    let city
    try {
      city = JSON.parse(wx.getStorageSync('historyCity').toString())
    } catch (e) {}
    if (city && city[0]) {
      return city[0]
    } else {
      let store = wx.getStorageSync('orientateStore')
      if (store) {
        return {id: store.cityId, name: store.cityName}
      } else {
        return {id: 320100, name: '南京'}
      }
    }
  },
  getLocation(success = () => {}) {
    if (this.location) {
      success(this.location)
    } else {
      if (!this.locationSuccessFn) {
        this.locationSuccessFn = []
      }
      this.locationSuccessFn.push(success)
      wx.getLocation({
        success: ({latitude, longitude}) => {
          this.location = {latitude, longitude}
          this.setData({location: this.location})
        },
        complete: () => {
          let successFn = this.locationSuccessFn
          while (successFn[0]) {
            successFn.shift()(this.location)
          }
        },
      })
    }
  },
  getStoreList(options) {
    let city = this.city
    let {success = () => {}, complete = () => {}} = options
    wx.request({
      url: `https://activity.cekid.com/activity/storeO2O/queryStoreofActivityList.do`,
      data: {
        city_code: city.id,
        lng: this.location && this.location.longitude,
        lat: this.location && this.location.latitude,
      },
      success: data =>
        success(
          ((data.data && data.data.data) || []).map(s => {
            let {lng, lat} = transformCoordinate().bd2gcj(
              s.longitude,
              s.latitude,
            )
            s.longitude = lng
            s.latitude = lat
            return s
          }),
        ),
      complete,
    })
  },
  onCallTap({target}) {
    let {storeId} = target.dataset
    let store = this.data.storeList.filter(s => s.entity === storeId)[0]
    wx.makePhoneCall({phoneNumber: store.contact_phone_01})
  },
  onNavigateTap({target}) {
    let {storeId} = target.dataset
    let store = this.data.storeList.filter(s => s.entity === storeId)[0]
    let {latitude, longitude, address_street, store_name} = store
    wx.openLocation({
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address_street,
      name: store_name,
    })
  },
  onStoreDetailTap({target}) {
    let {storeId} = target.dataset
    let store = this.data.storeList.filter(s => s.entity === storeId)[0]
    let {entity} = store
    let app = getApp()
    app[`__temp_store_detail_${entity}`] = store
  },
  onStoreTap(e) {
    if (!this.data.select) return
    const {storeId} = e.currentTarget.dataset
    const store = this.data.storeList.filter(s => s.entity === storeId)[0]
    saveStoreStorageAndReturn(store)
    saveCityStorage(
      store.address_city == '市辖区' ? store.province : store.city,
      store.address_city == '市辖区'
        ? store.address_province
        : store.address_city,
    )
    if (this.referer) {
      let url = this.referer.replace(/\{([^\}]+)\}/g, function(m, g) {
        let ret = ''
        switch (g) {
          case 'CITY_ID':
            ret = store.city
            break
          case 'CITY_NAME':
            ret = store.provinceName
            break
          case 'ENTITY_ID':
            ret = store.entity
            break
          case 'STORE_NAME':
            ret = store.store_name
            break
          default:
            ret = m
        }
        return ret
      })
      if (/^http(s?):\/\//.test(url)) {
        url = webViewUrl(url)
      }
      wx.navigateTo({
        url,
      })
      wx.switchTab({
        url,
      })
    } else {
      wx.navigateBack()
    }
  },
  onMarkerTap(e) {
    let {markerId} = e
    this.setActiveStore(markerId)
    this.setData({focusStore: `store_${markerId}`})
  },
  onCalloutTap(e) {
    this.setActiveStore(e.markerId)
  },
  setActiveStore(markerId) {
    let markers = this.data.markers
    let activeIndex
    if (this.activeStoreIndex !== undefined) {
      this.setData({
        [`markers[${this.activeStoreIndex}].callout.bgColor`]: '#ffb720',
      })
    }
    markers.forEach((marker, index) => {
      let {id} = marker
      if (id === markerId) {
        activeIndex = index
      }
    })
    this.activeStoreIndex = activeIndex
    this.setData({
      [`markers[${activeIndex}].callout.bgColor`]: '#ff337d',
    })
    let {storeList} = this.data
    storeList.sort((a, b) => {
      if (a.entity === markerId) {
        return -1
      } else if (b.entity === markerId) {
        return 1
      } else {
        return 0
      }
    })
    this.setData({
      storeList,
      activeStore: this.data.storeList.filter(s => s.entity === markerId)[0],
    })
  },
  onControlTap({controlId}) {
    switch (controlId) {
      case 'citySelector':
        wx.navigateTo({
          url: '../city/index',
        })
        break
    }
  },
  onMapRegionChange({type}) {
    if (type === 'end') {
      let map = wx.createMapContext('map')
      map.getCenterLocation({
        success: ({longitude, latitude}) => {
          this.getMapCenterCity(longitude, latitude)
        },
      })
    }
  },
  onActiveStoreTouchStart({touches}) {
    if (touches.length > 1) return
    this.touchPoint = {x: touches[0].clientX, y: touches[0].clientY}
  },
  onActiveStoreTouchEnd(e) {
    this.touchPoint = null
  },
  onActiveStoreTouchMove({touches}) {
    let {touchPoint} = this
    if (!touchPoint) return
    let point = {x: touches[0].clientX, y: touches[0].clientY}
    let dx = touchPoint.x - point.x
    let dy = Math.abs(touchPoint.y - point.y)
    if (dy > 20 && dy > dx / 2) {
      this.touchPoint = null
      this.setData({activeStore: null})
    }
  },
  onCitySelectorTap() {
    wx.navigateTo({url: '../city/index'})
  },
  onShow() {
    let cityNew = this.getStorageCity()
    let {city} = this
    if (city.id !== cityNew.id) {
      this.city = cityNew
      this.setData({city: this.city})
      this.renderCityBtn()
      this.renderStoreList()
    }
  },
  onLoad(options) {
    let {referer, select = false} = options
    this.referer = referer && decodeURIComponent(referer)
    this.select = !!(select || this.referer)
    this.setData({select: this.select})
    this.getMapCenterCity = debounce((lng, lat) => {
      wx.request({
        url: 'https://restapi.amap.com/v3/geocode/regeo',
        data: {
          key: 'f314522ef593bfb914470c5bd12b9452',
          location: `${lng},${lat}`,
        },
        success: ({data}) => {
          let {status} = data
          if (status === '1') {
            let {adcode, city, province} = data.regeocode.addressComponent
            let cityId
            let cityName
            if (city && city.length) {
              cityId = `${adcode.substr(0, 4)}00`
              cityName = city
            } else if (adcode && adcode.length) {
              cityId = `${adcode.substr(0, 2)}0000`
              cityName = province
            }
            if (!cityId || cityId === this.city.id) return
            this.city = {id: cityId, name: cityName}
            this.setData({city: this.city})
            this.renderStoreList({regionChange: true})
            this.renderCityBtn()
          }
        },
      })
    }, 1000)
    wx.showLoading({title: '加载中…'})
    let city = this.getStorageCity()
    this.city = city
    this.setData({city})
    this.renderStoreList()
    this.renderCityBtn()
  },
  renderStoreList({regionChange = false} = {}) {
    this.getLocation(() => {
      if (regionChange) {
        let map = wx.createMapContext('map')
        map.getCenterLocation({
          success: ({longitude, latitude}) => {
            this.updateStoreList(regionChange, {longitude, latitude})
          },
        })
      } else {
        this.location && this.setData({location: this.location})
        this.updateStoreList(regionChange)
      }
    })
  },
  updateStoreList(regionChange, {longitude, latitude} = {}) {
    this.getStoreList({
      success: data => {
        if (data.length === 0) {
          !regionChange &&
            wx.showModal({
              content: `您搜索的区域还未有门店入驻，是否切换至就近城市门店`,
              confirmText: '切换',
              cancelText: '取消',
              confirmColor: '#FF397E',
              success: ({confirm}) => {
                if (confirm) {
                  wx.navigateTo({url: '../city/index'})
                }
              },
            })
          if (regionChange) {
            this.setData({location: {longitude, latitude}})
          }
        }
        let locs = []
        let list = data.map((s, i) => {
          locs.push({
            id: s.entity,
            latitude: s.latitude,
            longitude: s.longitude,
            callout: {
              content: ' ' + s.store_name.toString() + ' ',
              bgColor: '#ffb720',
              color: '#ffffff',
              borderRadius: 50,
              padding: 3,
              display: 'ALWAYS',
            },
            iconPath: '../../../assets/icon_loc.png',
            height: 18,
            width: 13,
          })
          s.distance = Math.round(s.distance / 100) / 10
          return s
        })
        this.setData({
          markers: locs,
          storeList: list,
          activeStore: null,
        })
        if (!regionChange) {
          this.setData({
            points: locs,
          })
        }
      },
      complete: () => {
        wx.hideLoading()
      },
    })
  },
  renderCityBtn() {
    let ctx = wx.createCanvasContext('city')
    let ox = 0
    let oy = 0
    let tw
    let M_PI = Math.PI
    let cityName = this.city.name
    ctx.setFontSize(28)
    ctx.setTextAlign('left')
    if (ctx.measureText) {
      tw = ctx.measureText(cityName).width
    } else {
      if (cityName.length > 2) {
        cityName = cityName.substr(0, 2) + '...'
        tw = 80
      } else {
        tw = 60
      }
    }
    ctx.setFillStyle('#ffffff')
    ctx.setStrokeStyle('#ccc')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.arc(ox + 34, oy + 34, 30, M_PI / 2, (M_PI * 3) / 2)
    ctx.arc(ox + tw + 54, oy + 34, 30, M_PI / -2, M_PI / 2)
    ctx.closePath()
    ctx.stroke()
    // ctx.setShadow(0, 4, 4, 'rgba(0,0,0,.3)')
    ctx.fill()

    ctx.setLineWidth(2)
    ctx.setFillStyle('#444444')
    ctx.fillText(cityName, 32, 44)

    ctx.beginPath()
    ctx.setStrokeStyle('#444444')
    ctx.moveTo(tw + 40, 28)
    ctx.lineTo(tw + 50, 38)
    ctx.lineTo(tw + 60, 28)
    ctx.stroke()
    ctx.draw(false, () => {
      wx.canvasToTempFilePath(
        {
          canvasId: 'city',
          x: 0,
          y: 0,
          width: ox + tw + 92,
          height: 72,
          success: ({tempFilePath}) => {
            this.setData({
              mapControls: [
                {
                  id: 'citySelector',
                  iconPath: tempFilePath,
                  clickable: true,
                  position: {
                    left: 10,
                    top: 10,
                    width: (ox + tw + 92) / 2,
                    height: 36,
                  },
                },
              ],
            })
          },
          fail: e => {
            console.error(e)
          },
        },
        this,
      )
    })
  },
})
