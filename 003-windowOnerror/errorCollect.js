import { RequestApi, _GetModelID } from '@/Request'
import { CacheUtil } from './cacheUtil'

const MAX_LENGTH = 20
let userId = 1
let modelVersion = 1.0

export class LogCollect {
  constructor () {
    this.errorList = []
    this.errorData = null
    this.sendTimer = null
    this.currentArr = []// 当前上传的数据
  }

  init () {
    let _this = this
    // 初始化打开页面的时候，先检查是否有之前遗漏的错误未上传，如果有，则先上传之前的错误
    _this.sendTimer = setTimeout(async function () {
      let keys = await CacheUtil.getAllInfo()
      if (keys.length) {
        let result = await _this.setCurrentData()
        _this.saveToServer(result)
      }
    }, 0)

    // 捕获页面中的错误保存至本地，一分钟以后再将错误上传，以防集中发生错误的时候频繁请求服务器，浪费带宽
    window.onerror = (message, file, line, column, error) => {
      clearTimeout(_this.sendTimer)
      // console.log('发生了error===>')
      let id = userId + '/' + _GetModelID() + '/' + (new Date()).getTime()
      column = column || (window.event && window.event.errorCharacter) || 0// 不一定所有浏览器都支持col参数，如果不支持就用window.event来兼容
      _this.errorData = {
        id: id,
        message: message,
        file: file,
        line: line,
        column: column,
        error: error,
        time: setTimeFormat(new Date()),
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        cookie: window.document.cookie,
        userId: userId,
        modelId: _GetModelID(),
        modelVersion: modelVersion
      }
      _this.saveToLocal()// 每当发生错误，就实时保存至本地
      _this.errorList.push(_this.errorData)

      if (_this.errorList.length >= MAX_LENGTH) { // 若有个错误频繁发生，则无法触发定时器，那就达到最大长度后就直接上传
        let result = _this.errorList
        _this.saveToServer(result)
      } else { // 设置定时器，发生错误，一分钟后将数据上传
        _this.sendTimer = setTimeout(async function () {
          let result = await _this.setCurrentData()
          _this.saveToServer(result)
        }, 6000)
      }
      // return true;
    }
  }

  //  将数据保存至本地
  saveToLocal () {
    let _this = this
    CacheUtil.saveInfo(_this.errorData.id, _this.errorData)
  }

  // 设置当前上传的数据
  async setCurrentData () {
    let _this = this
    _this.currentArr = []
    // 从本地获取错误数据 ，赋值给currentArr
    let keys = await CacheUtil.getAllInfo()
    if (keys) {
      for (let i = 0; i < keys.length; i++) {
        let result = await CacheUtil.getInfo(keys[i].split('_')[1])
        _this.currentArr.push(result)
      }
    }
    return _this.currentArr
  }

  // 上传保存至服务器
  saveToServer (data) {
    return new Promise(() => {
      RequestApi('frontend_logs', {
        type: 'post',
        body: {
          content: data
        }
      }).then(() => {
        console.log('数据成功上传', data)
        //  如果上传服务器成功，就从本地存储中删除此记录
        CacheUtil.getAllInfo().then((keys) => {
          for (let i = 0; i < keys.length; i++) {
            if (keys[i].split('_')[1] === data[i].id) {
              CacheUtil.removeInfo(keys[i].split('_')[1])
            }
          }
        })
        this.errorList = []
      })
    })
  }
}

// 格式化时间为YYYY-MM-dd h:i:s
function setTimeFormat (time) {
  let d = time > 0 ? new Date(time) : new Date()
  let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
  let month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)
  let year = d.getFullYear()
  let hour = d.getHours() < 10 ? '0' + d.getHours() : d.getHours()
  let minute = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()
  let second = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()
  let millisecond = d.getMilliseconds() < 10 ? '0' + d.getMilliseconds() : d.getMilliseconds()
  if (millisecond < 100) {
    millisecond = '0' + millisecond
  }
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
}
