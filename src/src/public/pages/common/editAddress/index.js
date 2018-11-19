const api = require('../../../common/api')
const request = require('../../../common/request')
const { checkLogin, login } = require('../../../common/passport')
const { toast } = require('../../../common/util')

Page({
  data: {
    addrid: -1,
    currentAddress: {
      addrid: -1,
      addrtype: '0',
      uid: '',
      skey: '',
      name: '',
      mobile: '',
      region: '',
      addrtype: 0,
      address: '',
      property: 0
    }, // 当前的地址对象
    canSave: false, // 是否可以保存
    isShowRegion: false,
    provinces: [],
    citys: [],
    countys: [],
    value: [0, 0, 0],
    pro: '',
    city: '',
    area: '',
    toast: ''
  },
  showToast: function(toast, duration = 1500) {
    this.setData({ toast })
    setTimeout(() => {
      this.setData({ toast: '' })
    }, duration)
  },
  // 验证是否可以保存
  validateData() {
    const { currentAddress, isEdit } = this.data
    let canSave = true
    if (currentAddress.name.length <= 0) {
      canSave = false
    }
    if (currentAddress.mobile.length <= 0) {
      canSave = false
    }
    if (currentAddress.address.length <= 0) {
      canSave = false
    }
    return canSave
  },
  // 初始化省市区
  initRegion() {
    let provinces = []
    let citys = []
    let countys = []
    const { value } = this.data
    for (let i = 0; i < this.regionList.length; i++) {
      provinces.push(this.regionList[i])
    }
    citys = this.regionList[value[0]].c
    countys = citys[value[1]].c
    this.setData({
      'provinces': provinces,
      'citys': citys,
      'countys': countys
    })
  },
  // 获取省市区
  getRegionList() {
    // 请求数据
    request({
      url: api.API_GET_REGIONS,
      isSuccess: json => !!json,
      success: json => {
        if (json && json.AddressList && json.AddressList.length > 0) {
          this.regionList = json.AddressList
          if (this.data.addrid > -1) {
            this.getAddressById(checkLogin())
          } else {
            this.initRegion({
              'province': this.regionList[0],
              'city': this.regionList[0].c[0],
              'county': this.regionList[0].c[0].c[0]
            })
          }
        }
      }
    })
  },
  // 根据收货地址id获取收货地址
  getAddressById(passport) {
    // 请求数据
    request({
      url: api.API_GET_ADDRESS_BY_ID,
      data: {
        addrtype: '0',
        uid: passport.uid,
        skey: passport.skey,
        addrid: this.data.addrid
      },
      success: json => {
        const regionCode = json.data.regionid.split('_')
        let addressInfo = {
          addrtype: '0',
          uid: passport.uid,
          skey: passport.skey,
          name: json.data.name,
          mobile: json.data.mobile,
          region: json.data.regionid,
          addrtype: 0,
          address: json.data.address,
          property: json.data.property
        }
        this.setData({
          currentAddress: addressInfo,
          canSave: true,
          pro: json.data.province,
          city: json.data.city,
          area: json.data.district
        })
        let value = []
        let province = this.regionList.filter((ele, index) => {
          if (ele.i == regionCode[0]) {
            value.push(index)
            return ele.i == regionCode[0]
          }
        })
        let city = province[0].c.filter((ele, index) => {
          if (ele.i == regionCode[1]) {
            value.push(index)
            return ele.i == regionCode[1]
          }
        })
        let county = city[0].c.filter((ele, index) => {
          if (ele.i == regionCode[2]) {
            value.push(index)
            return ele.i == regionCode[2]
          }
        })
        this.setData({
          value
        })
        this.initRegion()
      },
      noLogin: () => {
        login(this.getAddressById)
      }
    })
  },
  onLoad(options) {
    this.setData({
      addrid: options.id || -1
    })
    const passport = checkLogin()
    if (passport) {
      this.getRegionList()
    } else {
      login()
    }
  },
  bindClearTap: function(e) {
    let currentAddress = Object.assign({}, this.data.currentAddress)
    currentAddress[e.target.id] = ''
    this.setData({
      currentAddress,
      canSave: false
    })
  },
  bindHideRegion(e) {
    if (e.target.dataset.id == 'region') {
      return
    }
    this.setData({
      isShowRegion: false
    })
  },
  bindShowRegion(e) {
    if (e.target.dataset.id == 'region') {
      this.setData({
        isShowRegion: true
      })
    }

  },
  bindConfirmRegion() {
    const { value, provinces } = this.data
    if (provinces && provinces.length) {
      this.setData({
        pro: provinces[value[0]].v,
        city: provinces[value[0]].c[value[1]].v,
        area: provinces[value[0]].c[value[1]].c[value[2]].v,
        isShowRegion: false
      })
    } else {
      this.setData({
        isShowRegion: false
      })
    }
  },
  bindPickerChange(e) {
    var currentValue = e.detail.value
    const { value } = this.data
    if (value[0] != currentValue[0]) {
      this.setData({
        value: [currentValue[0], 0, 0]
      })
    } else if (value[1] != currentValue[1]) {
      this.setData({
        value: [currentValue[0], currentValue[1], 0]
      })
    } else if (value[2] != currentValue[2]) {
      this.setData({
        value: currentValue
      })
    }
    this.regionList && setTimeout(() => {
      let citys, countys
      citys = this.regionList[currentValue[0]].c
      countys = this.regionList[currentValue[0]].c[currentValue[1]].c
      this.setData({
        citys,
        countys
      })
    }, 10)

  },
  // 新增或者修改时
  bindSave(e) {
    const passport = checkLogin()
    const { canSave, currentAddress, value, provinces, addrid, pro } = this.data
    if (passport) {
      if (canSave && !/^1\d{10}$/.test(currentAddress.mobile)) {
        this.showToast('请填写正确的手机号！')
        return
      }
      if (canSave && pro.length <= 0) {
        this.showToast('请选择正确的所在地！')
        return
      }
      if (canSave && !/^[a-zA-Z0-9 \u4e00-\u9fa5]+$/.test(currentAddress.name)) {
        this.showToast('收货人仅支持汉字、字母、数字、空格！')
        return
      }
      if (canSave && currentAddress.name.trim().length == 0) {
        this.showToast('请输入收货人！')
        return
      }
      if (canSave && !/^[a-zA-Z0-9 \(\)（）#\-\u4e00-\u9fa5]+$/.test(currentAddress.address)) {
        this.showToast('详细地址仅支持汉字、字母、数字、空格、括号、#、-！')
        return
      }
      if (canSave && currentAddress.address.trim().length == 0) {
        this.showToast('请输入详细地址！')
        return
      }
      
      let region = ''
      let p, c, d
      if (provinces && provinces.length) {
        p = provinces[value[0]]
        c = provinces[value[0]].c[value[1]]
        d = provinces[value[0]].c[value[1]].c[value[2]]  
        region = `${p.i}_${c.i}_${d.i}`
      }
      canSave && request({
        url: addrid == -1 ? api.API_ADD_ADDRESS : api.API_MODIFY_ADDRESS,
        data: {
          addrid,
          addrtype: '0',
          uid: passport.uid,
          skey: passport.skey,
          name: this.data.currentAddress.name,
          mobile: this.data.currentAddress.mobile,
          region,
          address: this.data.currentAddress.address,
          property: this.data.currentAddress.property ? 1 : 0
        },
        success: (res) => {
          const pages = getCurrentPages()
          let lastPage = null
          if (pages && pages.length > 1) {
            // 如果不是从列表进来的
            if (pages[pages.length - 2].route != 'pages/common/address/index') {
              let pValue = p && p.v || ''
              let cValue = c && c.v || ''
              let dValue = d && d.v || ''
              wx.setStorageSync('selectedAddress', {
                name: this.data.currentAddress.name,
                mobile: this.data.currentAddress.mobile,
                province: pValue,
                city: cValue,
                district: dValue,
                listAddress: `${pValue}${cValue}${dValue}${this.data.currentAddress.address}`,
                address: this.data.currentAddress.address,
                addrid: addrid > -1 ? addrid : res.addrid,
                regionid: region,
                timestamp: Date.now()
              })
            }

          }
          wx.showToast({
            title: addrid > -1 ? '修改成功' : '新增成功',
            duration: 1000
          })
          setTimeout(() => {
            wx.navigateBack({ delta: 1 })
          }, 1100)
        }
      })
    } else {
      login()
    }
  },
  // 删除时
  bindDelete() {
    const passport = checkLogin()
    if (passport) {
      wx.showModal({
        title: '删除',
        content: '确定删除吗？',
        cancelText: '取消',
        confirmText: '确定',
        success: (res) => {
          if (res.confirm) {
            request({
              url: api.API_DELETE_ADDRESS,
              data: {
                addrid: this.data.addrid,
                addrtype: '0',
                uid: passport.uid,
                skey: passport.skey
              },
              success: (res) => {
                wx.showToast({
                  title: '删除成功',
                  duration: 1000
                })
                // 判断是否在localstorage中
                const address = wx.getStorageSync('selectedAddress')
                if (address && (address.addrid == this.data.addrid)) {
                  wx.removeStorageSync('selectedAddress')
                } 
                setTimeout(() => {
                  wx.navigateBack({ delta: 1 })
                }, 1100)
              }
            })
          }
        }
      })
    } else {
      login()
    }
  },
  bindInputChange(e) {
    let tempAddress = Object.assign({}, this.data.currentAddress)
    tempAddress[e.target.dataset.id] = e.detail.value
    this.setData({
      currentAddress: tempAddress
    })
    // 没找到setData有回调
    setTimeout(() => {
      this.setData({
        canSave: this.validateData()
      })
    }, 10)
  }
})