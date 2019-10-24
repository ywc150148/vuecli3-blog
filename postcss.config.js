const autoprefixer = require('autoprefixer'); // 前缀自动补全
const pxtorem = require('postcss-pxtorem'); // px转rem
module.exports = {
  plugins: {
    'autoprefixer': {
      browsers: ['Android >= 4.0', 'iOS >= 7']
    },
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*']
    }
  }
}