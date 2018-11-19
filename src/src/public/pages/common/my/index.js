const api = require('../../../common/api')
const request = require('../../../common/request')
const tracker = require('../../../common/tracker')
const {checkLogin, login} = require('../../../common/passport')
const {hex_md5: hexMD5} = require('../../../common/md5')
const {webViewUrl} = require('../../../common/util')
import {IM_API} from 'wx-im/miniprogram_dist/index'

const pageid = '100004'
Page({
  data: {
    nickName: '',
    avatarUrl: '',
    header:
      'https://cmspic-10004025.image.myqcloud.com/444fc11d-1d66-452f-b059-2755a391b9f1',
    arrow: '',
    items: [],
    isLogin: false,
    toast: '',
    showNewCustomer: false, // 是否展示新客完善资料入口
    popup: null, // 新客礼包相关信息
    showNewCustomerPopup: false, // 是否展示优惠券弹窗
    needGetNewCustomerCoupon: false, // 离开页面去完善孕育信息时设置为true，完善过信息需要自动领券
    userInfo: null,
    appId: null,
    onlineNewGuest: 0,
    offlineNewGuest: 0,
    unreadMessage: 0,
    mobile: ''
  },

  // 获取用户积分
  getUserScore() {
    let {uid, skey} = checkLogin()
    wx.request({
      url: 'https://miniapp.cekid.com/score/score/GetConsumptionScore',
      data: {uid, skey},
      success: res => {
        let json = res.data
        if (json) {
          let {errno, data} = json
          if (errno == 1024) {
            login(() => {
              this.getUserScore()
            })
          } else if (data) {
            this.setData({userScore: data.accountpoints})
          }
        }
      },
    })
  },

  // 获取个人资产
  getUserAssets() {
    let {uid, skey} = checkLogin()
    let signCode = hexMD5(
      `key=q7eZiP5yeow9SgcxFZIC0LYGiJz5YJOy&skey=${skey}&uid=${uid}`,
    ).toUpperCase()
    wx.request({
      url:
        'https://miniapp.cekid.com/financeinfo/info-center/personCenter/queryIndex.do',
      data: {uid, skey, signCode},
      success: res => {
        let json = res.data
        if (json) {
          let {errno, data} = json
          if (errno == 1024) {
            login(() => {
              this.getUserAssets()
            })
          } else if (data) {
            let balance = data.filter(item => {
              return item.title === '余额'
            })
            if (balance.length) {
              let v = balance[0].text
              if (isNaN(Number(v))) {
                v = '0.00'
              } else {
                this.userHasOpenBalance = true
              }
              this.setData({userBalance: v})
            }
  
            let coupon = data.filter(item => {
              return item.title === '优惠券'
            })
            if (coupon.length) {
              this.setData({userCoupon: coupon[0].text})
            }
  
            let cardList = data.filter(item => {
              return item.title === '卡包'
            })
            if (cardList.length) {
              this.setData({userCardList: cardList[0].text})
            }
          }
        }
      },
      complete: res => {
        wx.hideLoading()
      },
    })
  },
  bindItemClick(e) {
    let {
      currentTarget: {
        dataset: {trackParam},
      },
    } = e

    tracker(`20000|${pageid}|${trackParam}`)
    let number = e.currentTarget.dataset.text.replace(/[^0-9]/gi, '')
    if (number && number.length > 8) {
      wx.makePhoneCall({
        phoneNumber: number,
      })
    } else {
      if (!this.data.isLogin) {
        this.showToast('请先登录再查看！')
        return
      }
      wx.navigateTo({
        url: e.currentTarget.dataset.url,
      })
      wx.switchTab({
        url: e.currentTarget.dataset.url,
      })
    }
  },
  bindLogin() {
    login((passport) => {
      this.getUserData(passport, () => {
        this.getUserCustomersPackage()
        this.getUserAssets()
        this.getUserScore()
      })
    })
  },
  onBalanceTap() {
    if (checkLogin()) {
      tracker(`20000|${pageid}|200040`)
      wx.navigateTo({
        url: webViewUrl(`https://cashier.cekid.com/wallet/index?cmd=share&sharetype=0`, {
          ...checkLogin(),
          phone: this.data.mobile
        }),
      })
    }
    
    // if (this.userHasOpenBalance) {
    //   wx.navigateTo({url: '../scancodePay/index'})
    // } else {
    //   wx.showModal({
    //     title: '提示',
    //     content: '小主，您还未开通余额支付，为保障安全，可去孩子王app开通哦~',
    //     confirmColor: '#ff5390',
    //     confirmText: '去体验',
    //     cancelText: '知道啦',
    //     success: ({confirm}) => {
    //       if (confirm) {
    //         wx.navigateTo({
    //           url: '/pages/app-download/index',
    //         })
    //       }
    //     },
    //   })
    // }
  },
  onTrackerTap({
    currentTarget: {
      dataset: {trackParam},
    },
  }) {
    tracker(`20000|${pageid}|${trackParam}`)
  },
  showToast: function(toast, duration = 1500) {
    this.setData({toast})
    setTimeout(() => {
      this.setData({toast: ''})
    }, duration)
  },
  getUserData(passport2, cb) {
    let passport = checkLogin()
    request({
      url: api.API_USER_INFO,
      data: passport,
      success: json => {
        this.setData(
          {
            nickName: json.data.nickname,
            avatarUrl:
              json.data.photo ||
              'https://cmspic-10004025.image.myqcloud.com/99f21106-703d-47b4-82cd-5983a199a604',
            isLogin: true,
            userlevel: json.data.userlevel,
            memberlevel: json.data.memberlevel,
            isVip: json.data.memberlevel === 4,
            onlineNewGuest: json.data.onlinenewguest,
            offlineNewGuest: json.data.offlinenewguest,
            mobile: json.data.mobile,
          },
          () => {
            cb && cb()
          },
        )
      },
      noLogin: () => {
        login(() => {
          this.getUserData(passport, cb)
        })
      },
    })
  },
  onCardTap() {
    wx.navigateToMiniProgram({appId: 'wx37fce51ecc04edf2'})
  },
  getNewCustomersConfig() {
    wx.request({
      url: api.API_GET_CMS_NEW_CUSTOMERS_CONFIG,
      success: json => {
        if (
          json &&
          json.data &&
          json.data.data &&
          json.data.data.popup &&
          json.data.data.popup.length
        ) {
          let now = new Date().getTime()
          let validePopupItems = json.data.data.popup.filter(
            popup =>
              now >= new Date(popup.startTime).getTime() &&
              now <= new Date(popup.endTime).getTime(),
          )
          if (validePopupItems.length) {
            // 有在有效时间内的配置项，保存配置项，并且获取新客状态
            this.setData({
              popup: validePopupItems[0],
              showNewCustomer:
                this.data.onlineNewGuest == 1 && this.data.offlineNewGuest == 1,
            })
          }
        }
      },
    })
  },
  bindGetNewCustomerCoupon() {
    this.setData({
      showNewCustomerPopup: true,
    })
  },
  bindClosePopup() {
    this.setData({
      showNewCustomerPopup: false,
    })
  },
  getNewCustomersCoupon(passport2) {
    let passport = checkLogin()
    wx.showLoading({
      title: '领取中',
      mask: true,
    })
    wx.request({
      url: api.API_GET_NEW_CUSTOMERS_COUPON,
      data: {
        cid: this.data.popup && this.data.popup.assemblyId,
        object_id: passport.uid,
      },
      header: {
        cookie: `uid=${passport.uid}; skey=${passport.skey}`,
      },
      success: json => {
        wx.hideLoading()
        if (json && json.data && json.data.code == 1001) {
          this.setData({
            showNewCustomerPopup: false,
          })
          wx.showToast({
            icon: 'success',
            title: '领取成功',
          })
        } else {
          wx.showModal({
            content: (json.data && json.data.message) || '系统错误',
            showCancel: false,
          })
        }
      },
    })
  },
  bindGetCouponBtn() {
    wx.showLoading({
      title: '查询中',
      mask: true,
    })
    let passport = checkLogin()
    // 点击领取优惠券按钮时，判断是否已经完善资料，如果没有完善，则需要跳转孕妇信息新增页面
    this.needCompleteDoc(passport, hasCompleted => {
      wx.hideLoading()
      if (hasCompleted) {
        // test
        this.getNewCustomersCoupon(passport)
        // this.setData({
        //   showNewCustomerPopup: false,
        // })
        // wx.showToast({
        //   icon: 'success',
        //   title: '领取成功'
        // })
      } else {
        this.setData(
          {
            needGetNewCustomerCoupon: true,
          },
          () => {
            wx.navigateTo({
              url: '/pages/pregnant-info/index?type=1',
            })
          },
        )
      }
    })
  },
  needCompleteDoc(passport2, cb) {
    let passport = checkLogin()
    wx.request({
      url: api.API_GET_BABY_INFO,
      data: passport,
      success: json => {
        if (
          json &&
          json.data &&
          json.data.data &&
          json.data.data.babyInfo &&
          json.data.data.babyInfo.length
        ) {
          cb(true)
        } else {
          wx.request({
            url: api.API_USER_INFO,
            data: passport,
            success: json => {
              if (json.data.errno == 0) {
                if (
                  json &&
                  json.data &&
                  json.data.data &&
                  (json.data.data.planpregnant == 1 ||
                    json.data.data.planpregnant == 2)
                ) {
                  cb(true)
                } else {
                  cb(false)
                }
              } else {
                wx.showModal({
                  content: json.errmsg,
                  showCancel: false,
                })
              }
            },
          })
        }
      },
    })
  },

  getUserCustomersPackage() {
    if (this.data.needGetNewCustomerCoupon) {
      this.setData({
        needGetNewCustomerCoupon: false,
        showNewCustomerPopup: false,
      })
      let passport = checkLogin()
      wx.showLoading({
        title: '查询中',
        mask: true,
      })
      this.needCompleteDoc(passport, hasCompleted => {
        wx.hideLoading()
        if (hasCompleted) {
          // test
          this.getNewCustomersCoupon(passport)
          // this.setData({
          //   showNewCustomerPopup: false,
          // })
          // wx.showToast({
          //   icon: 'success',
          //   title: '领取成功'
          // })
        } else {
          wx.showModal({
            title: '提示：',
            content: '完善孕育信息即可领取新客礼包，为您提供更精准服务。',
            cancelText: '以后再填',
            confirmText: '继续填写',
            confirmColor: '#FF6EA2',
            success: json => {
              if (json.confirm) {
                this.setData(
                  {
                    showNewCustomerPopup: false,
                    needGetNewCustomerCoupon: true,
                  },
                  () => {
                    wx.navigateTo({
                      url: '/pages/pregnant-info/index?type=1',
                    })
                  },
                )
              }
            },
          })
        }
      })
    } else {
      this.getNewCustomersConfig()
    }
  },

  getUnreadAmount(uid) {
    IM_API.getUnreadAmount(uid).then(res => {
      let unreadMessage = 0
      if (res > 0 && res < 100) {
        unreadMessage = res
      } else if (res >= 100) {
        unreadMessage = '99+'
      }
      this.setData({
        unreadMessage
      })
    }).catch((e) => {
      this.setData({
        unreadMessage: 0
      })
    })
  },

  // 考虑场景，需要优化
  onShow: function(options) {
    tracker(`10000|${pageid}|${pageid}`)
    const passport = checkLogin()
    this.setData({userInfo: passport})
    if (passport) {
      this.getUserData(passport, () => {
        this.getUserCustomersPackage()
        this.getUserAssets()
        this.getUserScore()
      })
      
      this.getUnreadAmount(passport.uid)
    } else {
      this.setData({
        isLogin: false,
      })
    }
    request({
      url: this.myConfig,
      isSuccess: data => !!data.data,
      success: json => {
        this.setData({
          header: json.data.header.img,
          arrow: json.data.arrow,
          items: json.data.items,
          headerVip: json.data.headerVip.img,
          navs: json.data.navs,
        })
      },
    })
  },
  onLoad: function() {
    /*if (!checkLogin()) {
      login()
    }*/
    const {appId, myConfig} = wx.getStorageSync('appConfig')
    Object.assign(this, {myConfig})
    this.setData({appId})
  },
})
