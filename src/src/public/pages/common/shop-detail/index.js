/**
 *
 */
const {
  saveStoreStorageAndReturn,
  saveCityStorage,
  transformCoordinate
} = require("../../../common/location");

Page({
  data: {},

  getLocation(success = () => {}) {
    if (this.location) {
      success(this.location);
    } else {
      if (!this.locationSuccessFn) {
        this.locationSuccessFn = [];
        wx.getLocation({
          success: ({ latitude, longitude }) => {
            this.location = { latitude, longitude };
            let successFn = this.locationSuccessFn;
            while (successFn[0]) {
              successFn.shift()(this.location);
            }
          }
        });
      }
      this.locationSuccessFn.push(success);
    }
  },
  getStoreDetail(options) {
    let { success = () => {}, entityId, complete = () => {} } = options;
    wx.request({
      url: `https://activity.cekid.com/activity/storeO2O/queryStoreDetail.do`,
      data: {
        store_code: entityId
      },
      success: data => {
        let detail = data.data.data;
        let { lng, lat } = transformCoordinate().bd2gcj(
          detail.longitude,
          detail.latitude
        );
        detail.longitude = lng;
        detail.latitude = lat;
        success(detail);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  onCallTap() {
    let { contact_phone_01 } = this.data;
    wx.makePhoneCall({ phoneNumber: contact_phone_01 });
  },
  onNavigateTap() {
    let { latitude, longitude, store_desc, address_street } = this.data;
    wx.openLocation({
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address_street,
      name: "孩子王" + store_desc
    });
  },

  onPicTap({ target }) {
    let { dataset } = target;
    let { pics, current } = dataset;
    pics = pics.map(pic => pic.replace(/\?.*$/, ""));
    current = current.replace(/\?.*$/, "");
    wx.previewImage({ urls: pics, current });
  },

  getExpense(storeId, callback) {
    wx.request({
      url:
        "https://miniapp.cekid.com/popapi/popapi-web/freightTemplate/qryFreightTemplate4C.do",
      data: {
        storeId: storeId
      },
      success: function(res) {
        callback(res);
      }
    });
  },

  getExpenseData() {
    wx.navigateTo({
      url: `/sub-pages/pages/carry-expense/index?storeId=${
        this.data.entityid
      }&storeName=${this.data.store_name}`
    });
  },

  onLoad(options) {
    let { entityid } = options;
    this.setData(options);
    let app = getApp();
    let param = `__temp_store_detail_${entityid}`;
    let store = app[param];
    if (store) {
      store.photo = store.photo.split(";");
      this.setData(store);
      delete app[param];
    } else {
      wx.showLoading();
      this.getStoreDetail({
        entityId: entityid,
        success: data => {
          data.photo = data.photo.split(";");
          this.setData(data);
        },
        complete: () => {
          wx.hideLoading();
        }
      });

      this.getExpense(entityid, res => {
        if (res.data && res.data.data && res.data.data.length) {
          this.setData({ carryExpense: true });
        } else {
          this.setData({ carryExpense: false });
        }
      });
    }
  }
});
