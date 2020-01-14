const path = require('path')
const color = require('colors')
const nodemon = require('nodemon')


function mock() {
  const argv = JSON.parse(process.env._argv)
  if (argv.proxy) {
    // 代理模式
    require('./server.js')
  } else {
    // 本地模式 通过nodemon使在本地模式时监测mocks文件的变动
    nodemon({
      script: path.resolve(__dirname, 'server.js'),
      watch: path.resolve(process.cwd, argv.mockPath),
      ext: 'js'
    }).on('restart', (files) => {
      console.log(color.yellow('服务重启中'), files)
    })
  }
}

module.exports = mock