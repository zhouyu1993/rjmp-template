const api = require('../../../common/api')
const request = require('../../../common/request')
const {checkLogin, login} = require('../../../common/passport')
const UserApi = require("kwapi/dist_weixin/interface/User").default;
// hasRefuse: false, // 是否已经拒绝授权
Page({
  data: {
    addressList: [],
    isLoadData: false,
    type: "", // 进入地址选择的类型，目前只有选择地址时传了值:select
    isShowToast: false,
    toastText: "",
    isGlobal: false,
    realNameInfo: null,
    hasAuthAddress: false // 是否已经授权获取地址
  },
  // 获取收货地址列表
  getAddressList(passport) {
    let addressList = [];
    // 请求数据
    request({
      url: api.API_GET_ADDRESS_LIST,
      data: {
        addrtype: "0",
        uid: passport.uid,
        skey: passport.skey
      },
      success: json => {
        for (var i = 0; i < json.data.length; i++) {
          let id = json.data[i].addrid;
          // 用来在列表中展示
          json.data[i].listAddress =
            json.data[i].province +
            json.data[i].city +
            json.data[i].district +
            json.data[i].address;
          addressList.push(json.data[i]);
          if (this.data.selectedId == id) {
            wx.setStorageSync("selectedAddress", json.data[i]);
          }
        }
        // 全球购商品获取实名信息
        if (this.data.isGlobal) {
          try {
            UserApi.getRealNameInfo()
              .then(res => {
                this.setData({ realNameInfo: res });
              })
              .catch(e => {
                console.log(e);
              });
          } catch (error) {
            console.log(error);
          }
        }
        this.setData(
          {
            addressList: addressList,
            isLoadData: true
          },
          this.showToast
        );
      },
      noLogin: () => {
        login(this.getAddressList);
      }
    });
  },
  onLoad(options) {
    this.setData({
      type: options.type || "",
      selectedId: options.selectedId || null,
      isGlobal: options.global || false
    });
  },
  onShow() {
    const passport = checkLogin();
    if (passport) {
      this.getAddressList(passport);
    } else {
      login(this.getUserData);
    }
  },
  // 添加收货地址
  bindAddAddress() {
    wx.navigateTo({
      url: "../editAddress/index"
    });
  },
  // 修改收货地址
  bindEditAddress(e) {
    // 在编辑区域
    if (e.detail.x > 280) {
      wx.navigateTo({
        url: `../editAddress/index?id=${e.currentTarget.dataset.id}`
      });
    } else {
      if (this.data.type == "select") {
        const selectedAddress = this.data.addressList.filter(ele => {
          if (
            this.data.realNameInfo &&
            this.data.realNameInfo.realName == ele.name
          ) {
            ele.tapRealName = true;
          }
          return ele.addrid == e.currentTarget.dataset.id;
        });

        wx.setStorageSync("selectedAddress", {
          ...selectedAddress[0],
          timestamp: Date.now()
        });
        wx.navigateBack({ delta: 1 });
      }
    }
  },
  // 微信添加地址
  bindAddWCAddress() {
    var self = this;
    const { hasAuthAddress } = this.data;
    const hasRefuse = wx.getStorageSync("hasRefuse");
    if (hasRefuse) {
      if (hasAuthAddress) {
        this.chooseAddress();
      } else {
        wx.getSetting({
          success: res => {
            if (
              res.authSetting["scope.address"] == undefined ||
              res.authSetting["scope.address"] == true
            ) {
              this.chooseAddress();
            } else {
              wx.openSetting({
                success: openRes => {
                  this.setData(
                    {
                      hasAuthAddress: openRes.authSetting["scope.address"]
                    },
                    () => {
                      if (openRes.authSetting["scope.address"]) {
                        this.chooseAddress();
                      }
                    }
                  );
                }
              });
            }
          }
        });
      }
    } else {
      this.chooseAddress();
    }
  },
  chooseAddress() {
    const hasRefuse = wx.getStorageSync("hasRefuse");
    wx.chooseAddress({
      success: res => {
        if (!this.checkAddressIsAdded(res)) {
          this.addAddress(res);
        } else {
          //this.showToast('该地址已存在')
          this.setData({
            toastText: "该地址已存在"
          });
        }
      },
      fail: res => {
        if (!hasRefuse) {
          wx.setStorageSync("hasRefuse", true);
          this.setData(
            {
              toastText: "请通过设置添加权限或手动添加地址"
            },
            this.showToast
          );
        }
      }
    });
  },
  // 判断微信新增的地址是否已经添加
  // addressInfo 从微信返回的透传地址
  checkAddressIsAdded(addressInfo) {
    const { addressList } = this.data;
    let isExist = false;
    addressList.forEach(item => {
      if (item.mobile.indexOf("****") > -1) {
        if (
          item.mobile ==
            addressInfo.telNumber.replace(
              /^(\d{3})(\d{4})(\d{4})$/,
              "$1****$3"
            ) &&
          item.address == addressInfo.detailInfo &&
          item.name == addressInfo.userName
        ) {
          isExist = true;
        }
      } else if (
        item.mobile == addressInfo.telNumber &&
        item.address == addressInfo.detailInfo &&
        item.name == addressInfo.userName
      ) {
        isExist = true;
      }
    });
    return isExist;
  },
  // 当选完地址之后，新增地址
  addAddress(addressInfo) {
    const passport = checkLogin();
    var province = addressInfo.nationalCode;
    const regObj = new RegExp(/^(\d{2})(\d{2})(\d{2})$/);
    const strs = regObj.exec(addressInfo.nationalCode);
    request({
      url: api.API_ADD_ADDRESS,
      data: {
        addrtype: "0",
        uid: passport.uid,
        skey: passport.skey,
        name: addressInfo.userName,
        mobile: addressInfo.telNumber,
        region: `${strs[1]}0000_${strs[1]}${strs[2]}00_${province}`,
        address: addressInfo.detailInfo
      },
      success: res => {
        //this.showToast('新增成功')
        /*this.setData({
          toastText: '新增成功'
        })*/
      },
      fail: res => {
        // this.showToast('新增失败')
        this.setData({
          toastText: "新增失败"
        });
      }
    });
  },
  showToast() {
    if (this.data.toastText) {
      setTimeout(() => {
        this.setData(
          {
            isShowToast: true
          },
          () => {
            setTimeout(() => {
              this.setData({
                isShowToast: false,
                toastText: ""
              });
            }, 2000);
          }
        );
      }, 100);
    }
  }
});
