<template>
  <div id="app" :class="{'add-padding':showTabbar}">
    <van-tabbar v-model="active" v-if="showTabbar">
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/tweet" icon="good-job-o">社区</van-tabbar-item>
      <!-- <van-tabbar-item to="/blog" icon="bullhorn-o">博客(暂时)</van-tabbar-item> -->
      <van-tabbar-item to="/notice" icon="bullhorn-o">通知</van-tabbar-item>
      <van-tabbar-item to="/user" icon="smile-o">我的</van-tabbar-item>
    </van-tabbar>
    <van-popup
      v-model="showPopup"
      closeable
      :safe-area-inset-bottom="true"
      close-icon-position="top-right"
      close-icon="cross"
      position="bottom"
      :style="{ height: '90%' }"
      @closed="handleClosed"
    >
      <transition name="van-slide-left">
        <login v-if="popupState.login"/>
      </transition>
      <transition name="van-slide-right">
        <reg v-if="popupState.reg"/>
      </transition>
    </van-popup>
    <!-- <router-view/> -->
    <keep-alive>
      <router-view v-if="$route.meta.keep_alive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keep_alive"></router-view>
    <!--这里是不会被缓存的组件-->
  </div>
</template>

<script>
import { Tabbar, TabbarItem, Popup } from "vant";
import Login from "./components/popup/login.vue";
import reg from "./components/popup/reg.vue";
import VueEvent from "./utils/VueEvent.js";

export default {
  name: "index",
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
    [Popup.name]: Popup,
    login: Login,
    reg: reg
  },
  data() {
    return {
      showTabbar: false,
      active: 0,
      showPopup: false,
      popupState: {
        reg: false,
        login: false
      },
      msg: "这里是App.vue"
    };
  },
  computed: {},
  watch: {
    $route(n, o) {
      // 刷新页面监听路由，设置taber选中
      let index = ["/", "/tweet", "/notice", "/user"].indexOf(n.path);
      index >= 0 && this.active !== index && (this.active = index);
      // 导航栏固定在底部，显示时添加padding-bottom
      this.showTabbar = index >= 0 ? true : false;
    }
  },
  created() {},
  mounted() {
    // 触发命令
    VueEvent.$on("handleOrder", opCode => {
      if (opCode === 1) {
        this.showPopup = true;
        this.popupSet("login");
      }
    });

    // 监听页面前进返回事件
    if (window.history && window.history.pushState) {
      window.addEventListener("popstate", this.popState, false); //false阻止默认事件
    }
  },
  destroyed() {
    window.removeEventListener("popstate", this.popState, false);
  },
  //  跨级访问祖先组件数据
  provide() {
    return {
      handleShowLogin: () => {
        this.showPopup = true;
        this.popupSet("login");
      },
      switchToReg: () => {
        this.popupSet("reg");
      },
      switchToLogin: () => {
        this.popupSet("login");
      },
      handleClosed: this.handleClosed
    };
  },
  methods: {
    popState() {
      VueEvent.$emit("popState", this.$route.path);
    },
    popupSet(key) {
      for (let k in this.popupState) {
        this.popupState[k] = k == key ? true : false;
      }
    },
    handleClosed() {
      this.showPopup = false;
      this.popupSet(null);
    }
  }
};
</script>

<style lang="less">
@import "./assets/css/public.css";
@import "./assets/css/mix.less";

html {
  // background: #f5f5f5;
  background: @baseBg;
  // background: red;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
  font-size: 16px;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.add-padding {
  padding-bottom: 1rem;
}

#app .markdown-body {
  padding: 0;

  ol,
  ul {
    list-style: inherit !important;
  }

  ul {
    list-style-type: disc !important;
  }

  ol {
    list-style-type: decimal !important;
  }

  .v-note-wrapper .v-note-panel .v-note-show .v-show-content {
    padding: 0;
  }

  .highlight pre,
  .markdown-body pre {
    padding: 0;
  }

  .highlight pre,
  pre {
    padding: 0px !important;
  }

  mark {
    padding: 0 4px;
    color: #fff;
    background: #555555;
  }
}

#app .article-details_content {

  .v-note-wrapper {
    min-height: auto !important;
  }

  .markdown-body {
    background-color: none !important;
    box-shadow: none !important;

    .v-note-op {
      background-color: none !important;
    }

    .v-note-img-wrapper {
      display: none !important;
    }

    .v-show-content,
    .scroll-style,
    .scroll-style-border-radius {
      background-color: none !important;
      background: none !important;
    }
  }
}
</style>
