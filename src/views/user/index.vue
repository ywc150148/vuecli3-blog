<template>
  <div class="user">
    <div class="user-head">
      <div v-if="isLogin">
        <div class="flex">
          <van-image
            class="user-head_image"
            round
            fit="cover"
            lazy-load
            :src="user.head_img"
            @click="showImagePreview(user.head_img)"
          >
            <template v-slot:loading>
              <van-loading size="20"/>
            </template>
            <template v-slot:error>加载失败</template>
          </van-image>
        </div>

        <p class="user-head_name van-ellipsis">{{user.nickname}}</p>
      </div>
      <div v-else>
        <van-row type="flex" gutter="20" align="center" @click="onShowLogin">
          <van-col>
            <van-image class="user-head_image" round fit="cover" lazy-load :src="stranger">
              <template v-slot:loading>
                <van-loading size="20"/>
              </template>
              <template v-slot:error>加载失败</template>
            </van-image>
          </van-col>
          <van-col class="f-w-blod">注册/登录</van-col>
        </van-row>
      </div>
    </div>

    <div class="user-cell">
      <van-cell title="账号管理" icon="user-circle-o" @click="handleManagMent">
        <van-icon slot="right-icon" name="replay" size="18px" style="line-height: inherit;"/>
      </van-cell>

      <van-cell title="设置" icon="setting-o" is-link to="/user/set">
        <van-icon slot="right-icon" name="exchange" size="18px" style="line-height: inherit;"/>
      </van-cell>

      <van-cell title="关于" icon="question-o" is-link to="/view"/>
    </div>
  </div>
</template>

<script>
import { ImagePreview, Row, Col, Image, Cell, Loading } from "vant";
import { mapState, mapMutations } from "vuex";
import { constants } from "fs";
import stranger from "../../assets/images/stranger.png";
import VueEvent from "../../utils/VueEvent.js";

const images = [
  "https://img.yzcdn.cn/vant/apple-1.jpg",
  "https://img.yzcdn.cn/vant/apple-2.jpg",
  "https://img.yzcdn.cn/vant/apple-3.jpg",
  "https://img.yzcdn.cn/vant/apple-4.jpg"
];

export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 通过 `vm` 访问组件实例
      // 获取历史记录
      let URL = document.URL;
      let hash = URL.split("#");
      vm.fromURL = hash[0] + "#" + from.fullPath;
    });
  },
  name: "user",
  inject: ["handleShowLogin", "handleClosed"],
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [Image.name]: Image,
    [Cell.name]: Cell,
    [Loading.name]: Loading
  },
  data() {
    return {
      stranger: stranger,
      fromURL: ""
      // show: false
    };
  },
  computed: {
    logoimg() {
      return stranger;
    },
    // 对象拓展符，映射 store.state.isLogin
    ...mapState(["isLogin", "user"])
  },
  created() {},
  mounted() {
    // 触发前进后退事件
    VueEvent.$on("popState", triggerPath => {
      triggerPath === "/user" && this.popState();
    });
  },
  methods: {
    ...mapMutations(["loGin", "logOut"]),
    popState() {
      this.handleClosed();
    },
    showImagePreview(href) {
      // 替换历史记录
      this.$tools.pushState(document.URL, this.fromURL);

      const instance = ImagePreview({
        images: [href], // 显示的图片
        lazyLoad: true,
        showIndex: false, // 不显示页码
        swipeDuration: 300,
        closeOnPopstate: true // 路由跳转时关闭图片
      });
    },
    onShowLogin() {
      // 替换历史记录
      this.$tools.pushState(document.URL, this.fromURL);
      this.handleShowLogin();
    },
    handleManagMent() {
      if (!this.isLogin) {
        // 替换历史记录
        this.$tools.pushState(document.URL, this.fromURL);
        this.handleShowLogin();
      } else {
        this.pushHref("/user/management");
      }
    }
  }
};
</script>

<style scoped lang="less">
@import "../../assets/css/user.less";
</style>
