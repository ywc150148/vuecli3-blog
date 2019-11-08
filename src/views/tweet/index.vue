<template>
  <div id="tweet" class="tweet" @scroll="onScroll">
    <van-nav-bar fixed :z-index="4" :border="false" v-show="!isScroll" @click-right="onWrite">
      <van-icon name="add-o" slot="right"/>
    </van-nav-bar>

    <div class="tweet-wrap">
      <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
        <div class="tweet-wrap_cover">
          <van-image
            class="tweet-wrap_cover__cover"
            fit="cover"
            lazy-load
            src="https://img.yzcdn.cn/vant/cat.jpeg"
            @click="handleImg(1,0,['https://img.yzcdn.cn/vant/cat.jpeg'])"
          >
            <template v-slot:loading>
              <van-loading type="spinner" size="20"/>
            </template>
            <template v-slot:error>加载失败</template>
          </van-image>
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
              <div class="tweet-list_item" @click="pushHref('/tweet/details/'+item._id)">
                <div
                  class="tweet-list_item__l"
                  @click.stop="pushHref('/tweet/individual/'+item.authorID._id)"
                >
                  <van-image fit="cover" lazy-load :src="BASEURL + item.authorID.head_img">
                    <template v-slot:loading>
                      <van-loading type="spinner" size="20"/>
                    </template>
                    <template v-slot:error>加载失败</template>
                  </van-image>
                </div>
                <div class="tweet-list_item__content">
                  <p
                    class="tweet-list_item__content___name"
                    @click.stop="pushHref('/tweet/individual/'+item.authorID._id)"
                  >{{item.authorID.nickname}}</p>
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
                      @click.stop="handleImg(item.images.length,img_index,item.images)"
                    >
                      <template v-slot:loading>
                        <van-loading type="spinner" size="20"/>
                      </template>
                      <template v-slot:error>加载失败</template>
                    </van-image>
                  </div>
                  <div class="tweet-list_item__content___bottom flex-nowrap-between-center">
                    <div
                      class="tweet-list_item__content___bottom-date"
                    >{{item.creatTime|getTimeAgo}}</div>
                    <div>
                      <div class="flex-nowrap-between-center">
                        <div @click.stop="onLike(item._id)">
                          <van-icon :name="item.isLike===true?'like':'like-o'"/>
                          <span>{{item.likes|totalQuantity}}</span>
                        </div>
                        <div @click.stop="onComment(item._id)">
                          <van-icon name="chat-o"/>
                          <span>{{item.reviewQuantity|totalQuantity}}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <van-divider v-show="index!=list.length-1"></van-divider>
            </div>

            <van-divider class="finished" v-show="finished">没有更多了</van-divider>
          </van-list>
        </div>
      </van-pull-refresh>
    </div>
    <van-image-preview
      v-model="showPreview"
      :startPosition="previewIndex"
      lazyLoad
      :images="previewImages"
    />

    <transition name="van-slide-up">
      <div class="tweet-comment-field" v-show="showCommentField">
        <div class="tweet-comment_button-row flex-nowrap-between-center">
          <van-icon name="cross" @click="hideCommentField"/>
          <van-button
            size="mini"
            type="primary"
            :disabled="CommentValNull"
            @click="handelComment"
          >发送</van-button>
        </div>
        <van-cell-group :border="false">
          <van-field
            v-model="commentValue"
            rows="1"
            :autosize="{maxHeight: 100}"
            type="textarea"
            maxlength="200"
            placeholder="请输入评论"
            show-word-limit
          ></van-field>
        </van-cell-group>
      </div>
    </transition>
  </div>
</template>

<script>
import {
  NavBar,
  PullRefresh,
  List,
  Divider,
  Image,
  Loading,
  Field,
  CellGroup,
  Button
} from "vant";
import { mapState, mapMutations } from "vuex";
import VueEvent from "../../utils/VueEvent.js";
import axios from "axios";
export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 通过 `vm` 访问组件实例
      // 如果有新数据，自动刷新页面
      vm.newData = to.meta.newData === true ? true : false;
      // 获取历史记录
      let URL = document.URL;
      let hash = URL.split("#");
      vm.fromURL = hash[0] + "#" + from.fullPath;

      // 有新数据，自动刷新
      vm.newData && vm.onRefresh();
    });
  },
  name: "tweet",
  inject: ["handleShowLogin"],
  components: {
    [NavBar.name]: NavBar,
    [PullRefresh.name]: PullRefresh,
    [List.name]: List,
    [Divider.name]: Divider,
    [Image.name]: Image,
    [Loading.name]: Loading,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button
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
      newData: false,
      showCommentField: false,
      commentValue: "",
      tweetID: "",
      fromURL: ""
    };
  },
  computed: {
    // 对象拓展符，映射 store.state.isLogin
    ...mapState(["isLogin", "user"]),
    CommentValNull() {
      let str = this.commentValue.replace(/\s+/g, "");
      return str.length < 1;
    }
  },
  watch: {
    $route(n) {
      if (n.path !== "/tweet") return;
      let tweet = document.getElementById("tweet");
      tweet.scrollTop = this.scrollTop;
      this.isScroll = false;
    },
    scrollTop(n, o) {
      // 判断是否向下滚动
      this.isScroll = n > o ? true : false;
    }
  },
  created() {},
  mounted() {
    this.docHeight = document.documentElement.clientHeight - 312 + "px";

    // 触发前进后退事件
    VueEvent.$on("popState", triggerPath => {
      triggerPath === "/tweet" && this.popState();
    });
  },
  destroyed() {},
  methods: {
    popState() {
      if (this.showPreview) {
        this.showPreview = false;
      }

      if (this.showCommentField) {
        this.showCommentField = false;
      }
    },
    getTweet() {
      this.$axios
        .get(RESTFULAPI.public.tweet, {
          params: {
            limit: this.limit,
            previousId: this.previousId
          }
        })
        .then(response => {
          let data = response.data.data;

          this.list = [...this.list, ...data];
          this.previousId = response.data.previousId;
          // 没有数据 true
          this.finished = response.data.nomore;

          // 加载状态结束
          this.loading = false;
          if (this.isLoading === true) {
            // this.$toast("刷新成功");
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
      this.previousId = "";
      this.getTweet();
    },
    handleImg(count, index, arr) {
      // 替换历史记录
      this.$tools.pushState(document.URL, this.fromURL);

      let reg = /:\/\//i;
      this.previewImages = arr.map(item => {
        let url = reg.test(item) ? item : BASEURL + item;
        return url;
      });

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
    onLike(_id) {
      if (this.isLogin !== true) {
        this.$toast("请先登录");
        this.handleShowLogin();
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
    },
    onComment(_id) {
      if (this.isLogin !== true) {
        this.$toast("请先登录");
        this.handleShowLogin();
        return;
      }

      if (this.tweetID != _id) {
        this.tweetID = _id;
        this.commentValue = "";
      }

      this.showCommentField = true;

      // 替换历史记录
      this.$tools.pushState(document.URL, this.fromURL);
    },
    hideCommentField() {
      this.showCommentField = false;
      this.$router.go(-1);
    },
    handelComment() {
      if (this.isLogin !== true) {
        this.$toast("请先登录");
        this.handleShowLogin();
        return;
      }

      this.$axios
        .post(RESTFULAPI.public.tweetComment, {
          _id: this.tweetID,
          commentValue: this.commentValue
        })
        .then(response => {
          this.commentValue = "";
          this.showCommentField = false;
          this.$toast(response.data.msg);

          this.list.findIndex(item => {
            if ((item._id = this.tweetID)) {
              item.reviewQuantity = response.data.reviewQuantity;
              return true;
            }
          });
        })
        .catch(error => {});
    }
  }
};
</script>

<style lang="less">
@import "../../assets/css/tweet.less";
</style>
