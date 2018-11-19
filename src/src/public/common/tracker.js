/**
 * 埋点上报
 * 需全局引入tracker
 * @param {string} params - logtype|pageid|eventid|param
 */

const trackerLib = require('../lib/tracker')

module.exports = function tracker(params, {biztype} = {}) {
  let [logtype, pageid, eventid, param] = params.split('|')
  trackerLib.report({
    logtype,
    pageid,
    eventid,
    param,
    biztype,
  })
}
