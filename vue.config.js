module.exports = {
  // host: "http://127.0.0.1", //本地服务器访问的路径
  // port: 4000, //本地服务器访问的端口
  publicPath: process.env.NODE_ENV === 'production' ?
    '/vue/demo/' : '/',
  assetsDir: './static',
  devServer: {
    // proxyTable: {
    //   '/api': {
    //     target: 'http://127.0.0.1:4000', // 后台接口域名
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api': '/'
    //     }
    //   }
    // }
  }
}