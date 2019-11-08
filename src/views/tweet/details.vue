<template>
  <div id="tweet" class="tweet tweet-details" @scroll="onScroll">
    <van-nav-bar
      left-text
      fixed
      :border="false"
      :z-index="5"
      left-arrow
      v-show="!isScroll"
      @click-left="onClickLeft"
    />

    <div class="tweet-wrap" :style="{minHeight:docHeight}">
      <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
        <div class="tweet-list">
          <div class="tweet-list_wrap" v-if="item">
            <div class="tweet-list_item">
              <div
                class="tweet-list_item__l"
                @click="pushHref('/tweet/individual/'+item.authorID._id)"
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
                  @click="pushHref('/tweet/individual/'+item.authorID._id)"
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
                    @click="handleImg(item.images.length,img_index,item.images)"
                  >
                    <template v-slot:loading>
                      <van-loading type="spinner" size="20"/>
                    </template>
                    <template v-slot:error>加载失败</template>
                  </van-image>
                </div>
                <div class="tweet-list_item__content___bottom flex-nowrap-between-center">
                  <div class="tweet-list_item__content___bottom-date">{{item.creatTime|getTimeAgo}}</div>
                  <div>
                    <div class="flex-nowrap-between-center">
                      <div @click="onLike()">
                        <van-icon :name="item.isLike===true?'like':'like-o'"/>
                        <span>{{item.likes|totalQuantity}}</span>
                      </div>
                      <div @click="onComment()">
                        <van-icon name="chat-o"/>
                        <span>{{item.reviewQuantity|totalQuantity}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>

      <div class="tweet-comments-wrap" v-if="item">
        <div class="tweet-comments-title-bg"></div>
        <van-divider class="finished">评论</van-divider>
        <van-pull-refresh v-model="isLoadingComment" @refresh="onRefreshComment">
          <van-list
            class="tweet-comments-list"
            v-model="loading"
            :finished="finished"
            :error.sync="error"
            error-text="请求失败，点击重新加载"
            v-if="comments.length"
            @load="onLoad"
          >
            <!-- ------------------ -->

            <div
              class="article-details_reply__item"
              v-for="(reply,replyIndex) in comments"
              :key="replyIndex"
            >
              <div
                class="article-details_reply__author flex-center"
                @click="pushHref('/tweet/individual/'+reply.reviewer._id)"
              >
                <van-image
                  fit="cover"
                  width="0.8rem"
                  height="0.8rem"
                  round
                  lazy-load
                  :src="BASEURL+ reply.reviewer.head_img"
                >
                  <template v-slot:loading>
                    <van-loading type="spinner" size="20"/>
                  </template>
                  <template v-slot:error>加载失败</template>
                </van-image>
                <span class="article-details_reply__author___name">{{reply.reviewer.nickname}}</span>

                <div class="article-details_reply__target-user flex-center" v-if="reply.targetUser">
                  <span class="article-details_reply__target-span">回复</span>
                  <span
                    class="article-details_reply__author___name"
                    @click.stop="pushHref('/tweet/individual/'+reply.targetUser._id)"
                  >{{reply.targetUser.nickname}}</span>
                </div>
              </div>

              <div class="article-details_reply__content">
                <div v-html="reply.content"></div>
              </div>

              <p class="article-details_reply__time flex-nowrap-between-center">
                <span>{{reply.meta.createAt|getTimeAgo}}</span>
                <span class="article-details_reply-btn" @click="onComment(reply._id)">回复</span>
              </p>
              <van-divider v-if="replyIndex!=comments.length-1"/>
            </div>

            <!-- ------------------------- -->

            <van-divider class="finished" v-show="finished">没有更多评论了</van-divider>
          </van-list>
          <div class="tweet-comments-null" v-else>
            <van-divider>还没有评论，下拉此处刷新</van-divider>
          </div>
        </van-pull-refresh>
      </div>
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
import axios from "axios";
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
    [Image.name]: Image,
    [Loading.name]: Loading,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button
  },
  data() {
    return {
      tweetID: "",
      item: "",
      comments: [],
      isLoadingComment: false,
      loading: false,
      error: false,
      finished: false,
      previousId: "",
      limit: 10,
      fromPath: "",
      // ---------

      docHeight: "",
      isLoading: false,
      showPreview: false,
      previewIndex: 0,
      previewImages: [],
      scrollTop: 0,
      isScroll: false,
      BASEURL,
      newData: false,
      showCommentField: false,
      commentValue: "",
      comment_id: ""
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
    this.docHeight = document.documentElement.clientHeight + "px";
    this.tweetID = this.$route.params.tweetID;
    this.getTweet();
    // 触发前进后退事件
    VueEvent.$on("popState", triggerPath => {
      triggerPath === this.$route.path && this.popState();
    });
  },
  destroyed() {},
  methods: {
    getTweet() {
      this.$axios
        .get(RESTFULAPI.public.tweetDetails + this.tweetID)
        .then(response => {
          this.item = response.data.data;
          this.comments = response.data.data.comments;
          this.previousId = response.data.previousId;
          if (this.isLoading === true) {
            this.isLoading = false;
          }
        })
        .catch(error => {
          if (this.isLoading === true) {
            this.$toast("刷新失败");
            this.isLoading = false;
          }
        });
    },
    onRefresh() {
      this.getTweet();
    },
    handleImg(count, index, arr) {
      // 替换历史记录
      this.$tools.pushState(document.URL, document.URL);
      let reg = /:\/\//i;
      this.previewImages = arr.map(item => {
        let url = reg.test(item) ? item : BASEURL + item;
        return url;
      });

      this.showPreview = true;
      this.previewIndex = index;
    },
    onScroll(e) {
      let ev = e || window.event;
      if (ev.target.scrollTop) {
        this.scrollTop = ev.target.scrollTop;
      }
    },
    onLike() {
      if (this.isLogin !== true) {
        this.$toast("请先登录");
        this.handleShowLogin();
        return;
      }

      this.$axios
        .post(RESTFULAPI.public.tweetLike, {
          _id: this.tweetID
        })
        .then(response => {
          this.item.isLike = response.data.isLike;
          this.item.likes = response.data.likes;
        })
        .catch(error => {});
    },
    onComment(_id = "") {
      // 替换历史记录
      this.$tools.pushState(document.URL, document.URL);
      if (this.isLogin !== true) {
        this.$toast("请先登录");
        this.handleShowLogin();
        return;
      }

      if (this.comment_id != _id) {
        this.commentValue = "";
      }

      this.comment_id = _id;

      this.showCommentField = true;
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
          commentValue: this.commentValue,
          mainCommentID: this.comment_id
        })
        .then(response => {
          this.item.reviewQuantity = response.data.reviewQuantity;

          this.commentValue = "";
          this.showCommentField = false;
          this.$toast(response.data.msg);
          // 没有评论则刷新
          if (this.comments.length < 1) {
            this.onRefreshComment();
          } else {
            // 在数组开头加入
            let arr = [response.data.data, ...this.comments];
            this.comments = arr;
          }
        })
        .catch(error => {});
    },
    onClickLeft() {
      if (this.fromPath == "/") {
        // 非此站跳转来源，点击返回 /tweet
        this.pushHref("/tweet");
      } else {
        this.$router.go(-1);
      }
    },
    // 加载评论
    onLoad() {
      this.$axios
        .get(RESTFULAPI.public.tweetComment, {
          params: {
            tweetID: this.tweetID,
            limit: this.limit,
            previousId: this.previousId
          }
        })
        .then(response => {
          let data = response.data.data;

          this.comments = [...this.comments, ...data];
          this.previousId = response.data.previousId;
          // 没有数据 true
          this.finished = response.data.nomore;

          // 加载状态结束
          this.loading = false;
          if (this.isLoadingComment === true) {
            // this.$toast("刷新成功");
            this.isLoadingComment = false;
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

          if (this.isLoadingComment === true) {
            this.$toast("刷新失败");
            this.isLoadingComment = false;
          }
        });
    },
    onRefreshComment() {
      this.comments = [];
      this.finished = false;
      this.loading = true;
      this.previousId = "";
      this.onLoad();
    },
    popState() {
      if (this.showPreview) {
        this.showPreview = false;
      }

      if (this.showCommentField) {
        this.showCommentField = false;
      }
    }
  }
};
</script>

<style lang="less">
@import "../../assets/css/tweet.less";
</style>
