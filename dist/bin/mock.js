#!/usr/bin/env node

const commander = require('commander')
const package = require('../../package.json')
const color = require('colors')

var mock = require('..')

// 定义命令行参数
commander.on('--help', () => {
  console.log(`\nAuthor:${color.yellow.bgRed.bold(package.author)}`)
})

commander
  .version(package.version, '-v --version', 'output the current version')
  .option('-o --host <host>', 'server host', 'localhost')
  .option('-p --port <port>', 'server port', 8080)
  .option('-r --proxy [proxy]', 'server proxy')
  .option('-m --mockPath <mockPath>', 'mockPath', 'mocks')
  .option('-l --logPath [logPath]', 'output log')
  .parse(process.argv)

// 将参数保存在process.env._argv中
process.env._argv = JSON.stringify(commander)

// 调用mock处理函数
mock()
