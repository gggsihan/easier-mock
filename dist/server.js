const Mock = require('mockjs');
const colors = require('colors');
const path = require('path');
const Koa = require('koa');
// koa-router返回的是一个函数
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const httpProxy = require('http-proxy-middleware');

const { readFiles, getLog } = require('./utils');

const app = new Koa()
// 解析请求体
app.use(bodyParser())

colors.setTheme({
  silly: 'rainbow',
  info: 'green',
  warn: 'yellow',
  error: 'red'
})

class MockServer {
  constructor() {
    this.argv = process.env._argv         // 参数集合
    this.port = this.argv.port            // 端口号
    this.host = this.argv.host            // 地址
    this.proxy = this.argv.proxy          // 代理地址
    this.mockPath = this.argv.mockPath    // mock读取地址
    this.mocks = {}                       // 所有mock对象
    this.errorMock = {}                   // 注册失败的mock对象

    // log输出方法
    const logPath = this.argv.logPath
    if (logPath) {
      this.log = getLog(logPath)
    } else {
      this.log = () => { }
    }
  }

  init() {
    console.log('this is init method')
    if (this.proxy) {
      this.proxyMode()
    } else {
      this.localMode()
    }
  }

  /** 代理模式
   */
  proxyMode() {
    const pro = httpProxy('/', {
      target: this.proxy,
      changeOrigin: true,
      pathRewrite: {
        '/': '/'
      },
      // 监听代理请求
      onProxyReq: (proxyReq, req, res) => {
        const reqInfo = this.setReqInfo(req)
        console.log(`[${reqInfo.time.red}] [${reqInfo.ip.cyan}] 请求 ${reqInfo.url.magenta} ${reqInfo.ua}`)
        this.log(` ${reqInfo.ip} 请求 ${reqInfo.url} ${reqInfo.ua}`)
      }
    })
    app.use(proxy)
    this.start()
  }

  /**本地模式
   */
  localMode() {
    readFiles(this.mockPath, (filesPaths) => {
      filesPaths.forEach(filePath => {
        let mockObj = require(filePath)
        Object.keys(mockObj).forEach(api => {
          // 把读取出来的mock全部存放在mocks中，如果出现重复api的情况则退出循环
          if (this.mocks[api]) {
            this.errorMock[api] = filePath
            return
          } else {
            this.mocks[api] = mockObj[api]
          }

          router.all(api, async (ctx, next) => {
            let reqInfo = this.setReqInfo(ctx.request)
            console.log(`[${reqInfo.time.red}] [${reqInfo.ip.cyan}] ${reqInfo.url.magenta} ${reqInfo.ua}`)
            let template = mockObj[api]
            let response
            // 判断当前api的mock是否为函数
            if (typeof template === 'function') {
              response = Mock.mock(template(ctx.request.body))
            } else {
              response = Mock.mock(template)
            }
            // mock解析为undefined情况处理
            response = response || {}
            // mock配置项 只支持延迟
            let config = response.mockConfig
            if (config) {
              let { delay } = config
              setTimeout(() => {
                ctx.response.json(response)
              }, delay);
            } else {
              ctx.response.json(response)
            }
            await next()
          })
        })
      })
    })
  }

  /**设置请求头信息
   * @param  {} req
   */
  setReqInfo(req) {
    let now = new Date();
    return {
      time: now.toLocaleDateString() + ' ' + now.toLocaleTimeString(),
      url: req.url,
      ip: req.ip,
      ua: req.get('user-agent')
    }
  }

  start() {
    app.listen(this.port, this.host, () => {
      if (!this.proxy) {
        console.log(colors.silly('****************************************************************'));
        console.log(`  本地模式已启动 {"接口数量": ${colors.info(Object.keys(this.mocks).length)}，"端口号": ${colors.info(this.port)}}`);
        console.log(colors.silly('****************************************************************'));
        let errors = Object.keys(this.errorMock);
        if (errors.length) {
            console.log(colors.warn(`  注册失败接口 {"接口数量":${errors.length}}`));
            errors.forEach(api => {
                console.log(`{"接口名称": ${api}, "所在文件": ${this.errorMock[api]}}`);
            })
        }
    } else {
        console.log(colors.silly('****************************************************************'));
        console.log(`  代理模式已启动 {"端口号": ${colors.info(this.port)}}`);
        console.log(colors.silly('****************************************************************'));
    }
    })
  }
}

const server = new MockServer()
server.init()
