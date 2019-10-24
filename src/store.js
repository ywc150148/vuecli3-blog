import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLogin: false,
    user: {
      name: '',
      nickname: "",
      head_img: '',
      sex: '',
    }
  },
  // 计算属性，实时监听变化
  getters: {
    getisLogin: state => {
      return state.isLogin;
    },
    getuser: state => {
      return state.user;
    }
  },
  // 修改数据 this.store.commit(methods,[value])
  mutations: {
    loGin: state => {
      state.isLogin = true;
    },
    logOut: state => {
      state.isLogin = false;
      Vue.tools.removeStorage("token");
      Vue.tools.removeStorage("user");
      Vue.tools.removeStorage("tweetDraft");
    },
    setLoginState: (state, bool) => {
      state.isLogin = bool;
    },
    setUser: (state, obj) => {
      // obj: {name:'xxx'}
      Object.assign(state.user, obj)
      Vue.tools.setStorage("user",state.user);
    }

  },
  // 提交给mutations，异步，this.$store.dispatch(methods,[value])
  actions: {
    setLogin(context, bool) {
      context.commit('setLoginState', bool);
      // 等价
      // context.state.isLogin = bool;
    }
  }
})