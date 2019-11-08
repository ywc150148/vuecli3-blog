<template>
  <div id="tweet" class="tweet" @scroll="onScroll">
    <van-nav-bar
      class="tweet-individual-navbar"
      left-text
      fixed
      :border="false"
      :z-index="5"
      left-arrow
      v-show="!isScroll"
      @click-left="onClickLeft"
    />

    <div class="tweet-wrap">
      <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
        <div class="tweet-wrap_cover">
          <van-image
            class="tweet-wrap_cover__cover"
            fit="cover"
            lazy-load
            src="https://img.yzcdn.cn/vant/cat.jpeg"
            @click="handleImg(1,0,['https://img.yzcdn.cn/vant/cat.jpeg'],false)"
          >
            <template v-slot:loading>
              <van-loading type="spinner" size="20"/>
            </template>
            <template v-slot:error>加载失败</template>
          </van-image>

          <transition name="fade">
            <div class="tweet-wrap_cover__head-wrap flex-nowrap-center" v-if="author">
              <van-image
                class="tweet-wrap_cover__head"
                fit="cover"
                lazy-load
                :src="BASEURL+author.head_img"
                @click="handleImg(1,0,[author.head_img],false)"
              >
                <template v-slot:loading>
                  <van-loading type="spinner" size="20"/>
                </template>
                <template v-slot:error>加载失败</template>
              </van-image>
              <div class="tweet-wrap_cover__head-right">
                <p class="tweet-wrap_cover__head-right___name van-ellipsis">{{author.nickname}}</p>
                <p class="tweet-wrap_cover__head-right___autograph van-ellipsis">我是一条虫，来自这个世界</p>
              </div>
            </div>
          </transition>
        </div>

        <div class="tweet-list" :style="{minHeight:docHeight}">
          <van-list
            v-model="loading"
            :finished="finished"
            :error.sync="error"
            error-text="请求失败，点击重新加载"
            @load="getTweet"
          >
            <div class="tweet-list_wrap" v-for="(item,index) in list" :key="index">
              <div
                class="tweet-list_item tweet-individual-list_item"
                @click="pushHref('/tweet/details/'+item._id)"
              >
                <div class="tweet-list_item__content">
                  <p class="tweet-list_item__content___text" v-text="item.content"></p>
                  <div
                    class="tweet-list_item__content___images flex"
                    :class="item.images.length>1?'tweet-list_item__content___images-more':''"
                    v-if="item.images.length"
                  >
                    <van-image
                      v-for="(img,img_index) in item.images"
                      :key="img_index"
                      fit="cover"
                      lazy-load
                      :src="BASEURL +img"
                      @click.stop="handleImg(item.images.length,img_index,item.images,true)"
                    >
                      <template v-slot:loading>
                        <van-loading type="spinner" size="20"/>
                      </template>
                      <template v-slot:error>加载失败</template>
                    </van-image>
                  </div>
                  <div class="tweet-list_item__content___bottom flex-nowrap-between-center">
                    <div class="tweet-list_item__content___bottom-date">
                      <span>{{item.creatTime|dateGet}}</span>
                      <span
                        class="tweet-list_item__content___bottom-delete"
                        v-if="oneself"
                        @click.stop="onDelete(item._id,index)"
                      >删除</span>
                    </div>
                    <div>
                      <div class="flex-nowrap-between-center">
                        <div @click.stop="onLike(item._id)">
                          <van-icon :name="item.isLike===true?'like':'like-o'"/>
                          <span>{{item.likes|totalQuantity}}</span>
                        </div>
                        <div>
                          <van-icon name="chat-o"/>
                          <span>{{item.reviewQuantity|totalQuantity}}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <van-divider></van-divider>
            </div>

            <van-divider class="finished" v-show="finished">没有更多了</van-divider>
          </van-list>
        </div>
      </van-pull-refresh>
    </div>
    <van-image-preview
      v-model="showPreview"
      :startPosition="previewIndex"
      :showIndex="showIndex"
      lazyLoad
      :images="previewImages"
    />

    <van-dialog
      v-model="showDialog"
      title="是否删除"
      show-cancel-button
      @cancel="handleCancel"
      @confirm="handleDelete"
    ></van-dialog>
  </div>
</template>

<script>
import {
  NavBar,
  PullRefresh,
  List,
  Divider,
  Dialog,
  Image,
  Loading
} from "vant";
import { mapState, mapMutations } from "vuex";
import VueEvent from "../../utils/VueEvent.js";

export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 通过 `vm` 访问组件实例
      if (from.path === "/") vm.fromPath = "/";
    });
  },
  name: "tweet",
  inject: ["handleShowLogin"],
  components: {
    [NavBar.name]: NavBar,
    [PullRefresh.name]: PullRefresh,
    [List.name]: List,
    [Divider.name]: Divider,
    [Dialog.Component.name]: Dialog.Component,
    [Image.name]: Image,
    [Loading.name]: Loading
  },
  data() {
    return {
      docHeight: "",
      isLoading: false,
      error: false,
      list: [],
      loading: false,
      finished: false,
      showPreview: false,
      previewIndex: 0,
      previewImages: [],
      scrollTop: 0,
      isScroll: false,
      limit: 10,
      previousId: "",
      BASEURL,
      authorID: "",
      author: "",
      oneself: false,
      showDialog: false,
      delete_id: "",
      delete_index: "",
      fromPath: "",
      showIndex: true
    };
  },
  computed: {
    // 对象拓展符，映射 store.state.isLogin
    ...mapState(["isLogin", "user"])
  },
  watch: {
    scrollTop(n, o) {
      // 判断是否向下滚动
      this.isScroll = n > o ? true : false;
    },
    author(n) {
      if (n.name == this.user.name) {
        this.oneself = true;
      }
    }
  },
  created() {},
  mounted() {
    this.docHeight = document.documentElement.clientHeight - 212 + "px";
    this.authorID = this.$route.params.authorID;

    // 触发前进后退事件
    VueEvent.$on("popState", triggerPath => {
      triggerPath === this.$route.path && this.popState();
    });
  },
  destroyed() {},
  methods: {
    popState() {
      if (this.showPreview) {
        this.showPreview = false;
      }
    },
    getTweet() {
      this.$axios
        .get(RESTFULAPI.public.tweet, {
          params: {
            limit: this.limit,
            previousId: this.previousId,
            authorID: this.authorID
          }
        })
        .then(response => {
          let data = response.data.data;

          this.author = this.author == "" ? response.data.author : this.author;

          this.list = [...this.list, ...data];
          this.previousId = response.data.previousId;
          // 没有数据 true
          this.finished = response.data.nomore;

          // 加载状态结束
          this.loading = false;
          if (this.isLoading === true) {
            this.$toast("刷新成功");
            this.isLoading = false;
          }

          this.error = false;
        })
        .catch(error => {
          if (this.finished === false) {
            this.error = true;
            this.loading = false;
          } else {
            this.error = false;
          }

          if (this.isLoading === true) {
            this.$toast("刷新失败");
            this.isLoading = false;
          }
        });
    },
    onRefresh() {
      this.list = [];
      this.finished = false;
      this.loading = true;
      this.finished = false;
      this.previousId = "";
      this.getTweet();
    },
    handleImg(count, index, arr, showIndex) {
      // 替换历史记录
      this.$tools.pushState(document.URL, this.fromURL);
      let reg = /:\/\//i;

      this.previewImages = arr.map(item => {
        let url = reg.test(item) ? item : BASEURL + item;
        return url;
      });

      this.showIndex = showIndex;
      this.showPreview = true;
      this.previewIndex = index;
    },
    onWrite() {
      if (this.isLogin === true) {
        this.pushHref("/tweet/write");
      } else {
        this.$toast("请先登录");
        this.handleShowLogin();
      }
    },
    onScroll(e) {
      let ev = e || window.event;
      if (ev.target.scrollTop) {
        this.scrollTop = ev.target.scrollTop;
      }
    },
    onClickLeft() {
      if (this.fromPath == "/") {
        // 非此站跳转来源，点击返回 /tweet
        this.pushHref("/tweet");
      } else {
        this.$router.go(-1);
      }
    },
    onDelete(_id, index) {
      this.delete_id = _id;
      this.delete_index = index;
      this.showDialog = true;
    },
    handleCancel() {
      this.delete_id = "";
      this.delete_index = "";
    },
    handleDelete() {
      this.$axios
        .post(RESTFULAPI.public.tweetDelete, {
          delete_id: this.delete_id
        })
        .then(response => {
          this.$toast(response.data.msg);
          this.list.splice(this.delete_index, 1);
        })
        .catch(error => {
          this.$toast(error.data.msg || "退出登录发生错误");
        });
    },
    onLike(_id) {
      if (this.isLogin !== true) {
        this.$toast("请先登录");
        return;
      }

      this.$axios
        .post(RESTFULAPI.public.tweetLike, {
          _id
        })
        .then(response => {
          let index = this.list.findIndex(item => {
            if (item._id == _id) {
              item.isLike = response.data.isLike;
              item.likes = response.data.likes;
            }

            return item._id == _id;
          });
        })
        .catch(error => {});
    }
  }
};
</script>

<style scoped lang="less">
@import "../../assets/css/tweet.less";

.tweet {
  padding-bottom: 0;
  .tweet-list {
    .tweet-list_wrap {
      .tweet-individual-list_item {
        padding-left: 10px !important;

        .tweet-list_item__content___bottom-delete {
          color: rgb(86, 156, 214);
        }
      }
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.9s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}
</style>
