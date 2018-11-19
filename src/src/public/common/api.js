// API

const appConfig = wx.getStorageSync('appConfig')
exports.API_USER_LOGIN = 'https://user.cekid.com/user/LoginbyWechatApplet'
exports.API_USER_REGISTER = 'https://user.cekid.com/user/RegisterByWechatApplet'
exports.API_USER_CONFIRM = 'https://user.cekid.com/user/ConfirmUser'
exports.API_USER_INFO = 'https://user.cekid.com/user/GetUserInfo'
exports.API_PICT_CODE =
  'https://verifycode.cekid.com/ucode-web/ucode/getNumber.do'
exports.API_VC_SEND_CODE = 'https://vc.cekid.com/sendverifycode/sendverifycode'
exports.API_GET_CITY = 'https://address.cekid.com/addressview/GetAllCityList'
// 个人中心CMS配置
exports.API_GET_MY_CONFIG = appConfig.myConfig
// 'https://cms.cekid.com/publish/998/mallMemberCenter.json' //appInstance.globalData.appConfig.myConfig
exports.API_GET_ADDRESS_LIST =
  'https://recvaddr.cekid.com/recvaddrsvc/GetReceiveAddressList'
exports.API_ADD_ADDRESS =
  'https://recvaddr.cekid.com/recvaddrsvc/AddReceiveAddress?'
exports.API_GET_ADDRESS_BY_ID =
  'https://recvaddr.cekid.com/recvaddrsvc/GetReceiveAddress'
exports.API_MODIFY_ADDRESS =
  'https://recvaddr.cekid.com/recvaddrsvc/ModifyReceiveAddress'
exports.API_GET_REGIONS = 'https://st.haiziwang.com/data/front/address.json'
exports.API_DELETE_ADDRESS =
  'https://recvaddr.cekid.com/recvaddrsvc/DeleteReceiveAddress'
exports.API_GET_COMMON_COUPON =
  'https://order.cekid.com/couponview/GetAvailableCouponList_OMNI'
exports.API_GET_OFFLINE_COUPON =
  'https://order.cekid.com/couponview/GetAvailableCouponList_OffLine'
exports.API_GET_ON_COUPON =
  'https://order.cekid.com/couponview/GetAvailableCouponList'
exports.API_GET_AVAIABLE_AND_UNAVAIABLE_COUPON =
  'https://coupon.cekid.com/omnicoupon/GetConfirmMultiCoupons'
exports.API_GET_DEFAULT_ADDRESS =
  'https://recvaddr.cekid.com/recvaddrsvc/GetDflReceiveAddress'
exports.API_GET_AVAIABLE_AND_UNAVAIABLE_COUPON_FOR_MALL =
  'https://miniapp.cekid.com/coupon/omnicoupon/GetConfirmCoupons'
exports.API_GET_AVAIABLE_AND_UNAVAIABLE_MULTI_COUPON_FOR_MALL =
  'https://miniapp.cekid.com/coupon/omnicoupon/GetConfirmMultiCoupons'
exports.API_GET_CMS_NEW_CUSTOMERS_CONFIG = 
  'https://cms.cekid.com/publish/988/wxnewcustomer.json'
exports.API_GET_CUSTOMER_IDENTITY = 
  'https://user.cekid.com/user/GetNewGuestIdentity'
exports.API_GET_BABY_INFO = 
  'https://user.cekid.com/user/GetBabyInfo'
exports.API_GET_NEW_CUSTOMERS_COUPON =
  'https://miniapp.cekid.com/coc/do'