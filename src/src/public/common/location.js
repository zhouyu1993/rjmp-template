// 高德转百度坐标转换
function transformCoordinate() {
  return {
    pi: 3.14159265358979324, // 圆周率
    a: 6378245.0, // 卫星椭球坐标投影到平面地图坐标系的投影因子
    ee: 0.00669342162296594323, // 椭球的偏心率
    x_pi: 3.14159265358979324 * 3000.0 / 180.0, // 圆周率转换量
    transformLat: function(lat, lon) {
      let ret =
        -100.0 +
        2.0 * lat +
        3.0 * lon +
        0.2 * lon * lon +
        0.1 * lat * lon +
        0.2 * Math.sqrt(Math.abs(lat))
      ret +=
        (20.0 * Math.sin(6.0 * lat * this.pi) +
          20.0 * Math.sin(2.0 * lat * this.pi)) *
        2.0 /
        3.0
      ret +=
        (20.0 * Math.sin(lon * this.pi) +
          40.0 * Math.sin(lon / 3.0 * this.pi)) *
        2.0 /
        3.0
      ret +=
        (160.0 * Math.sin(lon / 12.0 * this.pi) +
          320 * Math.sin(lon * this.pi / 30.0)) *
        2.0 /
        3.0
      return ret
    },
    transformLon: function(lat, lon) {
      let ret =
        300.0 +
        lat +
        2.0 * lon +
        0.1 * lat * lat +
        0.1 * lat * lon +
        0.1 * Math.sqrt(Math.abs(lat))
      ret +=
        (20.0 * Math.sin(6.0 * lat * this.pi) +
          20.0 * Math.sin(2.0 * lat * this.pi)) *
        2.0 /
        3.0
      ret +=
        (20.0 * Math.sin(lat * this.pi) +
          40.0 * Math.sin(lat / 3.0 * this.pi)) *
        2.0 /
        3.0
      ret +=
        (150.0 * Math.sin(lat / 12.0 * this.pi) +
          300.0 * Math.sin(lat / 30.0 * this.pi)) *
        2.0 /
        3.0
      return ret
    },
    // WGS坐标转换为GCJ坐标
    wgs2gcj: function(lat, lon) {
      let dLat = this.transformLat(lon - 105.0, lat - 35.0)
      let dLon = this.transformLon(lon - 105.0, lat - 35.0)
      let radLat = lat / 180.0 * this.pi
      let magic = Math.sin(radLat)
      magic = 1 - this.ee * magic * magic
      let sqrtMagic = Math.sqrt(magic)
      dLat =
        dLat * 180.0 / (this.a * (1 - this.ee) / (magic * sqrtMagic) * this.pi)
      dLon = dLon * 180.0 / (this.a / sqrtMagic * Math.cos(radLat) * this.pi)
      let mgLat = lat + dLat
      let mgLon = lon + dLon
      let result = []
      result.push(mgLat)
      result.push(mgLon)
      return result
    },
    // GCJ坐标转换为百度坐标
    gcj2bd: function(lat, lon) {
      let x = lon,
        y = lat
      let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi)
      let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi)
      let bd_lon = z * Math.cos(theta) + 0.0065
      let bd_lat = z * Math.sin(theta) + 0.006
      let result = []
      result.push(bd_lat)
      result.push(bd_lon)
      return result
    },
    // 世界大地坐标转为百度坐标
    wgs2bd: function(lat, lng) {
      let wgs2gcjR = this.wgs2gcj(lat, lng)
      return this.gcj2bd(wgs2gcjR[0], wgs2gcjR[1])
    },
    bd2gcj: function(bd_lng, bd_lat) {
      var X_PI = Math.PI * 3000.0 / 180.0
      var x = bd_lng - 0.0065
      var y = bd_lat - 0.006
      var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI)
      var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI)
      var gg_lon = z * Math.cos(theta)
      var gg_lat = z * Math.sin(theta)
      return {
        lng: gg_lon,
        lat: gg_lat,
      }
    },
  }
}

// 计算2个经纬度之间距离，单位m
function getDistance(lat1, lng1, lat2, lng2) {
  let radLat1 = lat1 * Math.PI / 180
  let radLat2 = lat2 * Math.PI / 180
  let a = radLat1 - radLat2
  let b = lng1 * Math.PI / 180 - lng2 * Math.PI / 180
  let s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2),
      ),
    )
  s = s * 6378137 // EARTH_RADIUS
  s = Math.round(s * 10000) / 10000
  return s
}

// 缓存保存门店并返回
function saveStoreStorageAndReturn(store) {
  let {latitude, longitude} = store
  let orientateStore = {
    cityId: store.address_city == '市辖区' ? store.province : store.city,
    cityName:
      store.address_city == '市辖区'
        ? store.address_province
        : store.address_city,
    entityId: store.entity,
    entityName: store.store_name,
    saveTimestamp: Date.now(),
    outStore: store.outStore && store.outStore == 1 ? 1 : 2, // 1店内、2店外
    latitude,
    longitude,
    distribute: {
      deliverOutside: store.is_delivery == 1,
      deliverInside: store.is_delivery_inside == 1,
      pickUpOutside: store.is_fetch_outside == 1,
      pickUpInside: store.is_fetch == 1,
      affiliateBill: !!store.affiliatedDelivery,
    },
  }

  // 写缓存
  wx.setStorageSync('orientateStore', orientateStore)

  return orientateStore
}

// 缓存保存历史城市
function saveCityStorage(cityId, cityName) {
  let historyCity = []
  try {
    let history = wx.getStorageSync('historyCity')
    if (history) {
      historyCity = JSON.parse(history)
    }
  } catch (e) {
    console.log(e)
  }
  let idx = historyCity.findIndex(data => data.id == cityId)
  if (idx !== -1) {
    historyCity.splice(idx, 1)
  }
  historyCity.unshift({
    id: cityId,
    name: cityName,
    timestamp: Date.now(),
  })
  historyCity.length > 6 && historyCity.pop()
  try {
    wx.setStorageSync('historyCity', JSON.stringify(historyCity))
  } catch (e) {
    console.log(e)
  }
}

exports.transformCoordinate = transformCoordinate
exports.getDistance = getDistance
exports.saveStoreStorageAndReturn = saveStoreStorageAndReturn
exports.saveCityStorage = saveCityStorage
