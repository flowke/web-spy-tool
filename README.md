# web-spy-tool

## 特性
工具集成了 [anyproxy](http://anyproxy.io/cn/), [chii](https://github.com/liriliri/chii). 主要面向前端人员对webview的调试. 

- [x] 自动化对页面注入chii, 快速对页面进行调试
- [x] 支持https
- [x] 本地化运行chii, 支持https
- [x] 便捷的重定向, 在webview快速调试本地代码
- [ ] 便捷的脚本注入 
- [ ] 移除CSP限制
- [x] 基于anyproxy, 集成了便捷的证书管理

## 安装与启动 
全局安装
```bash
-> npm i -g @xes/spy

-> spy serve
```
## cli 命令

### spy serve
启动服务

### spy ca

快速生成CA证书

### spy ca trust
信任证书

### spy ca clear
清除证书

### spy ca status

快速查看证书是否生成以及受信任状态

### spy ca init
生成证书以及进行信任操作

### spy ca path
证书所在路径

### spy ca open
在 macOS 系统上打开证书所在文件夹

## 配置文件
配置文件会存在以下两个地方:

* 用户级别: 用户目录/.spyconfig/SPYCONFIG.js
* 项目级别: cwd/SPYCONFIG.js (优先级高)


```js
module.exports = {
  https: true, //中间人代理是否开启https
  port: 8001, 
  chiiMode: 'http', //chii是否工作于https模式
  USER_HOME: process.env.HOME || process.env.USERPROFILE, // 用户目录所在地(默认)
  // https: //developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP
  removeCSP: true, // 是否移除CSP限制
  // 地址重定向: 方式一: 提供一个function
  replaceHost: (url,r)=>{
    // console.log(url, '======================');
    if (url.indexOf('scistatic') !== -1) {
      
      // console.log(r);
      return 'https://www.jianshu.com/'
    }
    
  },
  // 地址重定向: 方式而: 提供一个Array
  replaceHost: [
    'https://baidu.com', //对所有地址有效
    ['a.com', 'b.com'], //对特定域名进行重定向
  ],
  // 脚本注入
  injectScripts: [
    // 对所有html文件注入
    '//abc.com/cc.js',
    // 对指定域植入
    {
      target: 'xueersi.com', // 
      path: '/path/to/script.js' //脚本的路径,基于工作目录的相对地址或绝对地址
    }
  ]
}

```

## 关于正式配置
转到[证书配置](http://anyproxy.io/cn/#%E8%AF%81%E4%B9%A6%E9%85%8D%E7%BD%AE)