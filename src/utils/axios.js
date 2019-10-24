    // 引用axios和qs
    const axios = require('axios')
    const qs = require('qs');
    import Vue from 'vue'

    axios.defaults.timeout = 15000; //设置请求超时时间

    // 设置 post、put 默认 Content-Type
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

    // 正在进行中的请求队列
    let reqList = [];

    // 清除队列中已完成的请求
    const removeList = function (reqList, url) {
      let index = reqList.indexOf(url);
      if (index >= 0) {
        reqList.splice(index, 1)
      }
    }

    //axios 请求拦截
    axios.interceptors.request.use((config) => {

      // 设置授权认证：token
      let token = Vue.tools.getStorage('token');
      config.headers.Authorization = token;

      // 停止重复请求
      if (reqList.indexOf(config.url) != -1) {
        return Promise.reject({
          code: -1,
          msg: "队列中重复发送请求"
        });
      }

      // 把允许的请求记录到队列
      reqList.push(config.url);

      if (config.method == "post") {
        config.data = qs.stringify(config.data);
      }

      return config;

    }, error => {
      return Promise.reject(error);
    });


    // axios 响应拦截器
    axios.interceptors.response.use(
      (response) => {
        let url = Object.prototype.toString.call(response.config.url) === '[object Undefined]' ? null : response.config.url;
        url && removeList(reqList, url)

        if (response.data.code == 1) {
          return Promise.reject(response)
        }

        return response;
      },
      error => {

        if (Object.prototype.toString.call(error.response) !== '[object Undefined]') {
          console.log('error', error.response)
          Vue.toast(error.response.data.msg || "请求错误，状态码：" + error.response.status);
       
        } else {
          console.log("error------", error)
          reqList = [];
          Vue.toast(error.msg || "请求错误，状态码：" + error.response.status);
        }
        // 返回响应数据！
        return Promise.reject(error.response)
      }
    );

    export default axios