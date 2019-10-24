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
            @click="handleImg(1,0,'https://img.yzcdn.cn/vant/cat.jpeg')"
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
                      @click="handleImg(item.images.length,img_index,BASEURL +img)"
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
                      <div class="flex-nowrap-between-center" @click="$toast('即将开发')">
                        <div>
                          <van-icon name="like-o"/>
                          <span>{{item.likes}}</span>
                        </div>
                        <div>
                          <van-icon name="chat-o"/>
                          <span>{{item.comments}}</span>
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
  </div>
</template>

<script>
import { NavBar, PullRefresh, List, Divider, ImagePreview } from "vant";
import { mapState, mapMutations } from "vuex";
import VueEvent from "../../utils/VueEvent.js";

export default {
  name: "tweet",
  inject: ["handleShowLogin"],
  components: {
    [NavBar.name]: NavBar,
    [PullRefresh.name]: PullRefresh,
    [List.name]: List,
    [Divider.name]: Divider,
    [ImagePreview.name]: ImagePreview
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
      BASEURL
    };
  },
  computed: {
    // 对象拓展符，映射 store.state.isLogin
    ...mapState(["isLogin", "user"])
  },
  watch: {
    $route(n) {
      if(n.path!=='/tweet') return;
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
    console.log("BASEURL", BASEURL);
    this.docHeight = document.documentElement.clientHeight - 312 + "px";
    VueEvent.$on("onMsg", msg => {
      console.log("Tweet收到消息是：", msg);
    });

    // this.getTweet();
  },
  destroyed() {},
  methods: {
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

    getData() {
      this.$axios
        .get(API.public.tweet_list)
        .then(response => {
          this.list = [...this.list, ...response.data.data];

          // 加载状态结束
          this.loading = false;

          // 数据全部加载完成
          if (this.list.length >= 130) {
            this.finished = true;
          }

          if (this.isLoading === true) {
            this.$toast("刷新成功");
            this.isLoading = false;
          }

          this.error = false;
        })
        .catch(error => {
          this.$toast("获取文章详情失败");
          this.error = true;
          this.loading = false;

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
    handleImg(count, index, src) {
      this.previewImages = new Array(count).fill(src);
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
    }
  }
};
</script>

<style lang="less">
@import "../../assets/css/tweet.less"; 
</style>
