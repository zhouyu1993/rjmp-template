const {
  API_GET_AVAIABLE_AND_UNAVAIABLE_COUPON_FOR_MALL,
  API_USER_INFO
} = require("../../../common/api");
const request = require("../../../common/request");
const { checkLogin, login } = require("../../../common/passport");
const { formatDate } = require("../../../common/util");
// index.js
Page({
  /**
   * 页面的初始数据
   */

  data: {
    tabIndex: 0,
    apiCount: 0, // 三个接口是否同时调用成功
    isSuccess: false,
    tabs: [{name: '可用券',num: 0},{name: '不可用券',num: 0}],
    hasAvailableCoupon: false, // 是否有可用优惠券
    hasUnAvailableCoupon: false, // 是否有不可用优惠券
    currentDetail: {
      index: 0,
      subtype: "" // god,normal,freight
    }, // 当前要弹出框的具体信息
    isShowDetail: false,
    multi: false,
    dialog: {
      text: "",
      content: null
    }
  },
  setSelectedCoupons(e) {
    const { coupons } = e.detail;
    this.setData({
      availableCoupons: coupons
    });
  },
  bindConfirmSelectedCoupon() {
    const { availableCoupons } = this.data;
    let tempSelectedCoupons = [];
    if (availableCoupons && availableCoupons.length > 0) {
      availableCoupons.map(item => {
        if (item.Selected) {
          let tempItem = {};
          tempItem.code = item.Code;
          tempItem.type = item.Type;
          tempItem.name = item.Name;
          tempSelectedCoupons.push(tempItem);
        }
      });
    }
    wx.setStorage({
      key: "selectedCoupons",
      data: tempSelectedCoupons,
      success: () => {
        wx.navigateBack({ delta: 1 });
      }
    });
  },
  /*tab切换时*/
  bindTabChange(e) {
    this.setData({
      tabIndex: e.detail.tabIndex
    });
  },
  /*显示优惠券详情*/
  bindShowDetail(e) {
    const { unavailableCoupons } = this.data;
    const { subType, index } = e.detail;
    let tempData = {
      PackageDesc: ""
    };
    tempData = unavailableCoupons[index];
    this.setData({
      currentDetail: {
        text: "券适用范围",
        desc: tempData.PackageDesc
      },
      isShowDetail: true
    });
  },
  /*显示优惠券详情*/
  bindHideDetail() {
    this.setData({
      isShowDetail: false
    });
  },
  setFontSize(str) {
    if (str.length > 5) {
      return "smallString";
    }
    switch (str.length) {
      case 1:
      case 2:
      case 3:
        return "";
      case 4:
        return "fourString";
      case 5:
        return "fiveString";
    }
  },
  /*处理数据 */
  transData(data) {
    data &&
      data.map(ele => {
        if (ele.Price > 0) {
          // 处理金额
          ele.c_amt = (Math.round(ele.Price) / 100)
            .toFixed(2)
            .replace(/\.?0*$/, "");
        } else {
          ele.c_amt = "免邮";
        }

        ele.fontSize = this.setFontSize(ele.Price);
        ele.c_name = ele.Name;

        ele.storeRange = ele.Reason;
        // 金额下面的描述
        ele.desc = ele.Cash == 1 ? "无门槛使用" : `满${ele.CP / 100}元可用`;
        ele.validPeriod = `有效期：${formatDate(ele.Start)}-${formatDate(
          ele.End
        )}`;
        ele.isShow = false;
        return ele;
      });
    return data;
  },
  getUserData(passport, items, entityId, multi) {
    request({
      url: API_USER_INFO,
      data: passport,
      success: json => {
        this.apiCount++;
        this.getCoupons(passport, items, entityId, multi);
      }
    });
  },
  getCoupons(passport, items, entityId, multi) {
    passport.source = 2;
    passport.items = items;

    if (entityId != 8000) {
      passport.platformId = 1;
      passport.channelId = 2;
      passport.entityId = entityId;
    } else {
      passport.wsid = 1;
      if (!multi) {
        passport.version = "20170820";
      }
    }
    request({
      url: multi
        ? "https://miniapp.cekid.com/coupon/omnicoupon/GetConfirmMultiSellerCoupons"
        : API_GET_AVAIABLE_AND_UNAVAIABLE_COUPON_FOR_MALL,
      data: passport,
      success: json => {
        if (++this.apiCount == 2) {
          this.setData({
            isSuccess: true
          });
          wx.hideLoading();
        }
        json.data.availableCoupons = this.transData(json.data.availableCoupons);
        json.data.unavailableCoupons = this.transData(
          json.data.unavailableCoupons
        );
        json &&
          json.data &&
          this.setData({
            availableCoupons: json.data.availableCoupons,
            unavailableCoupons: json.data.unavailableCoupons
          });
        if (json.data.availableCoupons.length > 0) {
          this.setData({
            hasAvailableCoupon: true
          });
        }
        if (json.data.unavailableCoupons.length > 0) {
          this.setData({
            hasUnAvailableCoupon: true
          });
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { entityid, items, multi } = options;
    wx.showLoading();
    this.apiCount = 0;
    this.setData({
      multi: !!multi
    });
    const passport = checkLogin();
    if (passport) {
      this.getUserData(passport, items, entityid, multi);
    } else {
      login(this.getUserData);
    }
  }
});
