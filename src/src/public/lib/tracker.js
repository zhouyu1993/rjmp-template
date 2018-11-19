const systemInfo = wx.getSystemInfoSync();
const guid = wx.getStorageSync('guid') || genJguid();

const defaultData = {
  platformid: 1, // 孩子王1，成长加2
  appid: '',
  fronttime: 0,
  guid,
  userid: '0',
  platform: '06', // 小程序
  biztype: '001',
  logtype: '10000', // 页面浏览上报 10000，点击事件上报 20000，页面跳转上报 30000
  pagelevelid: '',
  viewid: '',
  viewparam: '',
  clickid: '',
  clickparam: '',
  os: systemInfo.system,
  devicetype: systemInfo.version,
  chansource: '',
  curpageurl: '',
  hseepread: '', // 备用字段
  hseextend: '', // 用作场景值
  search: JSON.stringify(systemInfo) // 用作系统信息
};

const state = {
  auto: false, // 是否自动上报
  exclude: [], // 开启自动上报时，排除的页面
  pageid: '',
  eventid: '',
  shareTicket: ''
};

function genJguid() {
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  };
  const guidValue = `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4() + S4() + S4()}`;
  wx.setStorageSync('guid', guidValue);

  return guidValue;
}

function mergeData(data) {
  Object.keys(defaultData).map(key => {
    if (data[key]) {
      defaultData[key] = data[key];
    }
  });
  Object.keys(state).map(key => {
    if (data[key]) {
      state[key] = data[key];
    }
  });
}

function getPage() {
  const pageStack = getCurrentPages();
  return pageStack[pageStack.length - 1];
}

function extendApp() {
  const oApp = App;
  App = function (appOpt) {
    extendEvent(appOpt, "onShow", appShow);
    oApp(appOpt);
  }
}

function extendPage() {
  const oPage = Page;
  Page = function (pageOpt) {
    extendEvent(pageOpt, "onLoad", pageLoad);
    extendEvent(pageOpt, "onShow", pageShow);
    if (pageOpt['onShareAppMessage']) {
      extendEvent(pageOpt, "onShareAppMessage", pageShare);
    }
    oPage(pageOpt);
  }
}

function extendEvent(pageOpt, event, fn) {
  if (pageOpt[event]) {
    const oFn = pageOpt[event];
    pageOpt[event] = function (eventOpt) {
      fn.call(this, eventOpt, event);
      return oFn.call(this, eventOpt);
    }
  } else {
    pageOpt[event] = function (eventOpt) {
      fn.call(this, eventOpt, event);
    }
  }
}

function appShow(options) {
  // 判断是否有群信息
  if (options.shareTicket) {
    state.shareTicket = options.shareTicket;
  }
  else {
    state.shareTicket = '';
    defaultData.chansource = '';
  }
  // 场景值
  defaultData.hseextend = options.scene || '';
}

function pageLoad(options) {
  // 商城特有需求，判断是否扫门店二维码进入
  if (options && options.scene) {
    const scene = decodeURIComponent(options.scene).split('&');
    for (let item of scene) {
      const kv = item.split('=');
      if (kv[0].toLowerCase() === 'fromentity' && kv[1]) {
        defaultData.hseextend += `|${kv[1]}`;
      }
    }
  }
}

function pageShow() {
  const page = getPage();
  // 判断是否自动上报
  if (state.auto && state.exclude.indexOf(page.route) === -1) {
    send({
      pageid: state.pageid,
      eventid: state.eventid
    });
  }
}

function pageShare() {
  // 点击分享按钮时上报
  send({
    pageid: '100038',
    eventid: '100038',
    biztype: '20',
    appid: '1'
  });
}

// 获取群信息，写入chansource
function getChansource(callback) {
  setTimeout(function() {
    wx.login({
      success: function (res) {
        wx.getShareInfo({
          shareTicket: state.shareTicket,
          success: function (obj) {
            defaultData.chansource = JSON.stringify({
              key: '群分享',
              value: {
                encrypted_data: obj.encryptedData,
                iv: obj.iv,
                code: res.code
              }
            });
            state.shareTicket = '';
            callback();
          }
        });
      }
    });
  }, 1000);
}

/**
 * 上报
 */
function send({ logtype = '10000', pageid, eventid, param, others, biztype, appid }) {
  const page = getPage();
  const passport = wx.getStorageSync('passport');

  const data = Object.assign({}, defaultData);
  Object.assign(data, {
    logtype,
    hseepread: others || '',
    appid: appid || defaultData.appid,
    biztype: biztype || defaultData.biztype,
    pagelevelid: pageid || '',
    userid: passport ? passport.uid : '0',
    fronttime: Date.now(),
    curpageurl: page.route
  });

  param = param || ((page && page.options && Object.keys(page.options).length) ? JSON.stringify(page.options) : '');
  if (logtype == '10000') {
    Object.assign(data, {
      viewid: eventid || '',
      viewparam: param
    });
  }
  if (logtype == '20000') {
    Object.assign(data, {
      clickid: eventid,
      clickparam: param
    });
  }

  wx.request({
    url: 'https://miniapp.cekid.com/track/newflow',
    method: 'POST',
    data: [data]
  });
}

/**
 * 初始化
 * @param appid
 * @param platformid = 1
 * @param biztype = 001
 */
function init(option = {}) {
  if (!option.appid) {
    return console.error(`tracker init: appid is required`);
  }

  mergeData(option);
  extendApp();
  extendPage();
}

function report(data) {
  if (state.shareTicket) {
    getChansource(function() {
      send(data);
    });
  }
  else {
    send(data);
  }
}

const tracker = {
  init, report
};

module.exports = global.tracker = tracker;