const wxbarcode = require("../../../common/wxCode");
const api = require("../../../common/api");
const request = require("../../../common/request");
const { checkLogin, login } = require("../../../common/passport");
Page({
  data: {
    isSuccess: false,
    name: "",
    memberLevel: 1, // 收费会员等级
    wrap: "", // 容器是哪个，用来控制背景
    navBg: "",
    levelText: ""
  },
  getUserData(passport) {
    request({
      url: api.API_USER_INFO,
      data: passport,
      success: json => {
        wx.hideLoading();
        wxbarcode.barcode("barcode", passport.uid.toString(), 590, 170);
        wxbarcode.qrcode(
          "qrcode",
          `uid=${passport.uid}&skey=${passport.skey}`,
          350,
          350
        );
        this.setData(
          {
            isSuccess: true,
            mobile: json.data.mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
            name: json.data.nickname,
            wrap: json.data.paidmemberlevel == 4 ? "neillo" : `other`,
            navBg: json.data.paidmemberlevel == 4 ? "#272829" : `#FF6EA2`,
            memberLevel: json.data.paidmemberlevel,
            levelText: `Lv.${json.data.userlevel}`
          },
          () => {
            wx.setNavigationBarColor({
              frontColor: "#ffffff",
              backgroundColor: this.data.navBg
            });
          }
        );
      },
      noLogin: () => {
        login(this.getUserData);
      }
    });
  },
  onLoad() {
    wx.showLoading();
    const passport = checkLogin();
    if (passport) {
      this.getUserData(passport);
    } else {
      login(this.getUserData);
    }
  }
});
