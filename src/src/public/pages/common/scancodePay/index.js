// pages/common/scancodePay/index.js
const request = require('../../../common/request')
var barcode = require('../../../common/barCode')
var qrcode = require('../../../common/qrCode')
var api = 'https://miniapp.cekid.com'

const { checkLogin, login } = require('../../../common/passport')

Page({
  data: {
    payCode: '',
    formatPayCode: '',
    paymentMode: '01',
    barcodeURL: '',
    qrcodeURL: '',
    balance: 0, // 星享融余额
    activityTitle: '', // 星享融活动标题
    status: "2", //星享融授权 1已授权 2未授权
    accountBalance: 0, // 钱包
    isLogin: false,
    passport: null,
    timeoutCount: 0,
    timeoutId: undefined,
    pwdSet: [],
    openPanel: false,
    isUnloaded: false,
  },

  onLoad: function (options) {
    console.log('onload..')
    this.setData({
      isUnloaded: false
    })
    const passport = checkLogin()
    const that = this
    // return
    if (passport) {
      this.initPaycode(passport)
      this.setData({
        isLogin: true,
        passport
      })
    } else {
      this.doLogin().then((res) => {
        this.initPaycode(res)
      })
    }
  },

  onUnload () {
    clearTimeout(this.data.timeoutId)
    this.setData({
      isUnloaded: true
    })
  },

  doLogin () {
    return new Promise((rs, rj)=> {
      login((res) => {
        this.setData({
          isLogin: true,
          passport: res
        })
        rs(res)
      }, (e) => {
        console.log('login error:', e)
        rj(e)
      })
    })
  },

  checkChange (e) {
    const val = e.currentTarget.dataset.val
    if (val === this.data.paymentMode) return
    if (val === '02') {
      if (this.data.status !== '1') {
        wx.showToast({title: '没有开通呢，可去孩子王app操作哦~', icon:'none', duration: 2000})
        return 
      }
    } 
    this.setData({
      paymentMode: val
    })
    this.initPaycode(this.data.passport)
  },

  // uid, partnerId paymentMode 01 宝宝钱包，02星享融育儿宝 03礼品卡
  initPaycode (passport) {
    let that = this
    clearTimeout(this.data.timeoutId)
    this.setData({
      timeoutCount: 0
    })
    wx.request({
      url: `${api}/cashier/hzw-wallet-web/scanpay/initPayCode.do?uid=${passport.uid}&skey=${passport.skey}&paymentMode=${this.data.paymentMode}`,
      success (res) {
        const data = res.data
        if (data.code === '1') {
          if (data.html === '1992') { // 需弹出输入支付密码界面???? 未开通
            that.alert('您还未开通')
          }
          if (data.data) { // 扫描码
            that.updatePaycode(data.data.payCode)
            that.setData({
              accountBalance: data.data.accountBalance / 100,
              balance: data.data.balance ?  data.data.balance / 100 : 0,
              status: data.data.status
            })
            clearTimeout(that.data.timeoutId)
            if (data.data.paymentMode === that.data.paymentMode) {
              const sid = setTimeout(that.getPayInfo, 2000)
              that.setData({
                timeoutId: sid
              })
            }
          }
        } else if (data.code === '0') {
          that.alert(data.msg)
        } else if (data.code == '8001') { // 账户登录态失效
          that.doLogin().then((res) => {
            that.initPaycode(res)
          })
        }
      }
    })
  },

  getPayInfo () {
    if (this.data.isUnloaded) {
      return
    }
    let that = this
    this.setData({
      timeoutCount: this.data.timeoutCount +  2
    })
    wx.hideLoading()
    wx.request({
      url: `${api}/cashier/hzw-wallet-web/scanpay/getPayInfo.do?uid=${that.data.passport.uid}&skey=${that.data.passport.skey}&timecount=${this.data.timeoutCount}&paycode=${this.data.payCode}&paymentMode=${this.data.paymentMode}`,
      success (res) {
        const data = res.data
        if (data.code === '1') {
          that.checkState(data.html, data.data)
        } else { // 出错
          that.alert(data.msg)
        }
      },
      fail (e) {console.log('fail:', e)},
      complete () {
        const sid = setTimeout(that.getPayInfo, 2000)
        that.setData({
          timeoutId: sid
        })
      }
    })
  },

  checkState (code, paycode) {
    switch(code) { 
      case '1994': // 没改变
        break
      case '1995': // 更新界面付款码
        this.updatePaycode(paycode)
      break
      case '1996': // 成功或者失败
        this.getPayResult(paycode)
      break
      case '1997': // 需密码
        this.invokePwd()
      break
      case '1998': // 正在支付中
        wx.showLoading({title: '加载中'})
      break
      default:
        break
    }
  },
  beautCode (paycode) {
    let rs = ''
    let begin = 0
    for (let i = 4; i < paycode.length; i+=4) {
      rs += paycode.slice(begin,i) + ' '
      begin += 4
    }
    return rs.replace(/\s+$/g, '') +paycode.slice(begin,paycode.length)
  },
  updatePaycode (paycode) {
    let that  = this
    this.setData({
      payCode: paycode,
      formatPayCode: this.beautCode(paycode),
      timeoutCount: 0
    })
    this.qrc('qrcode', paycode, 320, 320, ()=> {
      // console.log('qrcode .....cb... ')
      that.getImage('qrcode', 320, 320).then(res => {
        that.setData({
          qrcodeURL: res.tempFilePath
        })
        console.log('转图片', res.tempFilePath)
        return res
      }).catch(res =>{
        console.log('catch...', res)
        return res
      })
    })

    this.barc('barcode', paycode, 600, 160).then(()=>{
      console.log('bar finish') // do not trigger.
    })
  },

  invokePwd () {
    if (this.data.openPanel === true) return
    this.setData({
      openPanel: true,
      pwdSet: []
    })
  },
  doInput (e) {
    if (this.data.pwdSet.length >= 6) return
    this.data.pwdSet.push(e.currentTarget.dataset.val)
    this.setData({
      pwdSet: this.data.pwdSet
    })
    if (this.data.pwdSet.length === 6) {
      this.validPwd()
    }
  },
  del (e) {
    this.data.pwdSet.pop()
    this.setData({
      pwdSet: this.data.pwdSet
    })
  },
  closePanel () {
    this.setData({
      openPanel: false
    })
  },

  validPwd () {
    const that = this
    wx.showLoading({title: '加载中'})
    wx.request({
      url: `${api}/cashier/hzw-wallet-web/scanpay/validPassword.do`,
      type: 'POST',
      header: {'content-type': 'application/x-www-form-urlencoded'},
      data: {
        pwd: that.data.pwdSet.join(''),
        paycode: this.data.payCode,
        uid: this.data.passport.uid,
        skey: this.data.passport.skey,
      },
      success (res) {
        wx.hideLoading()
        const data = res.data
        if (data.code === '1') {
          // that.getPayResult()
        } else if (data.code === '2004') { 
          wx.showToast({title: '密码错误'})
        } else if (data.code === '8001') { 
          that.alert(data.msg)
          that.doLogin().then((res) => {
            that.validPwd()
          })
        } else if (data.code === '3028') { 
          that.alert('密码被冻结')
        } else if (data.code === '3023') { 
          that.alert('密码错误')
          that.setData({
            pwdSet: []
          })
        } else { // error
          that.alert(data.msg)
        }
        // console.log('recheck,,,,,,', res)
      },
      fail (e) {
        wx.hideLoading()
        console.log('fail:', e)
      },
      complete () {
      }
    })
  },

  // 启用暂停扫码付
  enabledScanPay (flag) {

  },

  getPayResult(paycode) {
    let that = this
    wx.request({
      url: `${api}/cashier/hzw-wallet-web/scanpay/getPayInfoByPaycode.do?paycode=${this.data.payCode}&uid=${that.data.passport.uid}&skey=${that.data.passport.skey}`,
      success (res) {
        wx.hideLoading()
        const data = res.data
        if (data.code === '1') {
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            openPanel: false
          })
        } else { // error
          that.alert(data.msg)
          that.setData({
            pwdSet: []
          })
        }
      },
      fail (e) {
        wx.hideLoading()
        console.log('fail:', e)
      },
      complete () {
      }
    })
  },

  alert(msg) {
    wx.showModal({
      title: '错误提示',
      content: msg,
      showCancel: false
    })
  },

  convert_length(length) {
    return Math.round(wx.getSystemInfoSync().windowWidth * length / 750)
  },

  barc(id, code, width, height) {
    return new Promise((resolve, reject) => {
      const content = wx.createCanvasContext(id)
      barcode.code128(
        content,
        code,
        this.convert_length(width),
        this.convert_length(height),
        () => {
          resolve(content)
        },
      )
    })
  },

  qrc(id, code, width, height, cb) {
    qrcode.api.draw(code, {
      ctx: wx.createCanvasContext(id),
      width: this.convert_length(width),
      height: this.convert_length(height),
    }, null, null, cb)
  },

  getImage(id, width, height) {
    return new Promise((resolve, reject) => {
      console.log('getImage', id)
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width,
        height,
        destWidth: width,
        destHeight: height,
        canvasId: id,
        success: function(res) {
          resolve(res)
        },
        fail: function(rej) {
          console.log('rej', rej)
          reject(rej)
        },
        complete () {}
      })
    })
  },

})