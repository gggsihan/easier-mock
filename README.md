# easier-mock
Mock Objects replace collaborators of the unit under test
Used to start the mock server and provide log output function
用于启动mock服务器，并提供log输出功能

### Install

```
$ npm install easier-mock
```
## **Options**

```
Options:
  -v, --version                 output the current version
  -o, --host <host>             server host (default: "localhost")
  -p, --port <port>             server port (default: 8080)
  -r, --proxy [proxy]           server proxy (default: "")
  -m, --mockPath <mockPath>     read mockPath (default: "mocks")
  -l, --logPath [logPath]       output log (default: "") 
  -h, --help                    output usage information
```

### host
start server at 127.0.0.0, default is localhost
服务启动地址为127.0.0.0，默认为localhost
```
mock -o 127.0.0.0
```

### port
start server at port 8081, default port is 8080
服务启动端口为8081，默认为8080
```
mock -p 8081
```

### proxy
you can start the server in proxy mode by configure proxy
你可以通过配置代理地址来获取数据
```
mock -r https://google.com
```

### mockPath
you can also start the server in local mode by configure mockPath，default is 'mocks' under thecurrent working directory
你同样可以通过配置mockPath来获取模拟数据, 默认为当前工作目录下的mocks文件
```
mock -m src/mocks
```

the files under the mockPath should export an object which key is api, and the value has two types
mockPath下的文件应导出一个对象，key为接口请求地址，value有两种类型:
(support mockjs 支持mockjs语法)

-Object
```js   
module.exports = {
  "/user": {
    // mock配置项，目前只支持延迟时间
    mockConfig: {
        delay: 2000
    },
    'a|3-5': 'a',
    'list|10': [{ 'id|+1': 0 }]
  },
  "/name": {
    'b|3-5': 'a',
    'list|10': [{ 'id|+1': 0 }]
  }
}
``` 

-Function
```js   
module.exports = {
  "/user": function(body) {
    if (body.params) {
      return {
        'a|3-5': 'a',
        'list|10': [{ 'id|+1': 0 }]
      }
    }
  }
}
``` 

### logPath
you can output logs by configure logPath, default is not to output logs
你可以通过配置logPath来指定日志输出地址，默认不输出日志
```
mock -l logs
```
