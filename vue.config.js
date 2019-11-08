const HOSTNAME = process.env.NODE_ENV === 'production' ? 'https://www.eoway.cn' : 'http://127.0.0.1:4000'

module.exports = {
  // 生成环境 sourceMap
  productionSourceMap:false,
  publicPath: process.env.NODE_ENV === 'production' ?
    '/dist/' : '/',
  assetsDir: './static',
  devServer: {
    proxy: {
      '/api': {
        target: HOSTNAME,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}