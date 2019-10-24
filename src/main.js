import Vue from 'vue'
import App from './App.vue'
import './utils/tools'
import router from './router'
import store from './store'
import axios from './utils/axios'
import {
  API,
  RESTFULAPI,
  BASEURL
} from './utils/api'
import 'amfe-flexible';
import {
  Lazyload,
  Row,
  Col,
  Popup,
  Image,
  Loading,
  Field,
  Cell,
  CellGroup,
  Button,
  Icon,
  Toast,
  Tag,
  Picker,
  Uploader,
  ImagePreview
} from 'vant';

Vue.use(Lazyload, {
  lazyComponent: true
}).use(Row).use(Col).use(Popup).use(Image).use(Loading).use(Field).use(Cell);
Vue.use(CellGroup).use(Button).use(Icon).use(Toast).use(Tag).use(Picker).use(Uploader);
Vue.use(ImagePreview);

require('./utils/mock')

// api
global.API = API;
global.RESTFULAPI = RESTFULAPI;
global.BASEURL = BASEURL;
Vue.prototype.$axios = axios;

Vue.prototype.pushHref = function (href) {
  router.push(href);
}

Vue.prototype.goBack = function (n = -1) {
  router.go(n);
}

Vue.toast = Toast;

Vue.filter('timeAgo', function (value) {
  // 接收日期时间
  if (!value) return ''
  let ts = Vue.tools.getTimeStamp(value);
  let time = Vue.tools.timeAgo(ts);
  return time;
})

Vue.filter('getTimeAgo', function (utc) {
  // utc 时间 2018-03-07T16:00:00.000Z
  if (!utc) return '';
  return Vue.tools.timeAgo(new Date(utc).getTime())
})


Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')