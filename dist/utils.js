const fs = require('fs')
const path = require('path')
const {promisify} = require('util')

const color = require('colors')
const log4js = require('log4js');

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

/** 读取指定路径下的文件或目录
 * @param  {} dir 读取的目录
 * @param  {} callback 读取完文件后的回调
 */
function readFiles(dir, callback) {
  let filesPaths = []

  function next(dir, callback) {
    readdir(dir).then((list) => {
      let count = list.length
      let done = function() {
        count--
        if (!count) {
          callback(filesPaths)
        }
      }
      list.forEach(async(file) => {
        let p = path.join(dir, file)
        let statObj = await stat(p)
        if (statObj.isDirectory()) {
          next(p, done)
        } else {
          if (path.extname(p) === '.js') {
            filesPaths.push(p)
          }
          done()
        }
      })
    }).catch((err) => {
      console.log(color.red('请创建该目录' + dir + '，存放mock数据'))
    })
  }

  next(dir, callback)
}

/**日志输出方法 --文件形式
 * @param  {} logPaht 日志输出地址
 */
function getLog(logPaht) {
  log4js.configure({
    appenders: {
      'log': {
        type: 'dateFile',
        filename: path.resolve(process.cwd(), logPaht),
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true,
        layout: {
          type: 'pattern',
          pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] [%c] ------> %m'
        }
      }
    },
    categories: {
      default: { appenders: ['log'], level: ['info'] }
    }
  })
  const logger = log4js.getLogger('log')
  if (logger) {
    return function(str) {
      logger.info(str)
    }
  }
  return () => {}
}

module.exports = {
  readFiles,
  getLog
}