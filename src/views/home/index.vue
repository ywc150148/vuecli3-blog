<template>
  <div class="home" :class="{'home-wrap':isScroll}">
    <van-search v-model="keywords" placeholder="请输入搜索关键词" show-action @search="onSearch">
      <div slot="action" @click="onSearch">搜索</div>
    </van-search>

    <div class="home-tabs-wrap home-tabs">
      <van-tabs v-model="active" animated>
        <van-tab v-for="(item,cat_index) in category" :key="cat_index" :title="item.name">
          <div class="home-tabs_tab__list" :ref="'tab__list-'+cat_index">
            <!-- 骨架屏 -->
            <div class="home-article-skeleton" v-show="loading && category[active].isLoading">
              <van-skeleton
                v-for="skeleton in 3"
                :key="skeleton"
                avatar
                avatar-size="40px"
                title
                :row="4"
              />
            </div>

            <!-- 下拉 -->

            <!-- :disabled="!category[cat_index]" -->
            <van-pull-refresh
              v-model="category[cat_index].isLoading"
              @refresh="onRefresh"
              style="min-height:9rem;"
            >
              <!-- 分类页 -->
              <van-list
                style="min-height:9rem;"
                v-model="loading"
                v-show="!category[cat_index].isLoading"
                :error.sync="category[cat_index].error"
                :offset="100"
                error-text="请求失败，点击重新加载"
                :finished="category[cat_index].finished"
                :finished-text="category[cat_index].finished_text"
                @load="onLoad"
              >
                <!-- 文章预览 -->
                <div
                  class="home-article"
                  v-for="(item,index) in category[cat_index].list"
                  :key="index"
                  @click="pushHref('/article/details/' + item._id)"
                >
                  <div class="home-article_title-wrap flex-nowrap-center">
                    <p class="home-article_title">{{item.title}}</p>
                    <!-- <span
                      v-if="item.categoryID"
                    >{{item.categoryID.name}}{{item.subCategoryID? '/'+item.subCategoryID.name:''}}</span> -->
                  </div>
                  <div class="home-article_pre flex-nowrap-between-center">
                    <div class="home-article_pre__l">
                      <div class="home-article_pre__l___author flex-nowrap">
                        <div>
                          <van-image
                            fit="cover"
                            width="0.5rem"
                            height="0.5rem"
                            round
                            lazy-load
                            :src="BASEURL + item.authorID.head_img"
                          >
                            <template v-slot:loading>
                              <van-loading type="spinner" size="20"/>
                            </template>
                            <template v-slot:error>加载失败</template>
                          </van-image>
                        </div>

                        <div class="home-article_pre__l___author-name">{{item.authorID.nickname}}</div>
                      </div>

                      <div
                        class="home-article_pre__l-paragraph line-clamp-2"
                      >{{item.content|cutStr}}</div>
                    </div>
                    <div class="home-article_pre__r" v-if="item.cover">
                      <van-image
                        fit="cover"
                        width="2rem"
                        height="1.5rem"
                        lazy-load
                        :src="item.cover"
                      >
                        <template v-slot:loading>
                          <van-loading type="spinner" size="20"/>
                        </template>
                        <template v-slot:error>加载失败</template>
                      </van-image>
                    </div>
                  </div>
                  <div class="home-article_bottom">
                    <div class="flex-nowrap">
                      <!-- <div>
                        <van-icon name="eye-o"/>
                        <span>{{item.views|totalQuantity}}</span>
                      </div> -->
                      <div>
                        <van-icon :name="item.isLike===true?'good-job':'good-job-o'"/>
                        <span>{{item.likes|totalQuantity}}</span>
                      </div>
                      <div>
                        <van-icon name="chat-o"/>
                        <span>{{item.comments|totalQuantity}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <div
      class="home-go-to-Write"
      :class="{'home-go-to-Write-hide':isScroll}"
      v-if="isLogin"
      @click="pushHref('/blog/write')"
    >
      <van-icon name="plus"/>
    </div>
  </div>
</template>

<script>
import {
  Search,
  Tab,
  Tabs,
  List,
  PullRefresh,
  Skeleton,
  Image,
  Loading
} from "vant";
import { mapState, mapMutations } from "vuex";

export default {
  name: "",
  filters: {
    cutStr: function(str) {
      return str.substring(0, 200);
    }
  },
  components: {
    [Search.name]: Search,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [List.name]: List,
    [PullRefresh.name]: PullRefresh,
    [Skeleton.name]: Skeleton,
    [Image.name]: Image,
    [Loading.name]: Loading
  },
  data() {
    return {
      category: "",
      keywords: "开发一个Web应用",
      active: 0,
      list: [],
      loading: false,
      error: false,
      finished_text: "",
      scrollTop: 0,
      isScroll: false,
      isLoading: false,
      limit: 10,
      BASEURL
    };
  },
  computed: {
    ...mapState(["isLogin", "user"])
  },
  watch: {
    $route(n, o) {
      // 回到此页面 滚动条滚动到上次的位置
      if (n.path == "/") {
        this.$nextTick(() => {
          let re = "tab__list-" + this.active;
          this.$refs[re][0].scrollTop = this.scrollTop;
        });
      }
    },
    scrollTop(n, o) {
      // 用于判断是否向下滚动
      this.isScroll = n > o ? true : false;
    }
  },
  created() {},
  mounted() {
    window.addEventListener("scroll", this.onScrollTop, true);
    this.getCategory();
  },
  methods: {
    getCategory() {
      this.$axios
        .get(RESTFULAPI.public.blog, {
          params: {
            limit: this.limit
          }
        })
        .then(response => {
          this.category = response.data.category;
          this.category.forEach((item, index) => {
            if (index === 0) {
              item.list = response.data.data;
              item.finished = response.data.nomore;
              item.previousId = response.data.previousId;
              item.count = response.data.count;
            } else {
              item.list = [];
              item.finished = false;
              item.previousId = "";
              item.count = 0;
            }

            item.loading = false;
            item.isLoading = false;
            item.error = false;
            item.finished_text =
              item.count > 0 && item.finished ? "没有更多了" : "没有数据";
          });
        })
        .catch(error => {
          this.$toast("获取分类失败");
        });
    },
    getData(active, refresh = false) {
      let params = {
        categoryID: this.category[active]._id,
        previousId: this.category[active].previousId,
        limit: this.limit
      };

      this.$axios
        .get(RESTFULAPI.public.blog, { params })
        .then(response => {
          // if (refresh) {
          //   this.category[active].list = [];
          // }

          let data = response.data.data;
          this.category[active].list = [...this.category[active].list, ...data];
          this.category[active].finished = response.data.nomore;
          this.category[active].previousId = response.data.previousId;
          this.category[active].count = response.data.count;
          this.category[active].finished_text =
            this.category[active].count > 0 && this.category[active].finished
              ? "没有更多了"
              : "没有数据";

          this.loading = false;
          this.category[active].error = false;
          if (this.category[active].isLoading === true) {
            this.category[active].isLoading = false;
            this.$toast("刷新成功");
          }
        })
        .catch(error => {
          this.loading = false;
          this.category[active].error = true;
          if (this.category[active].isLoading === true) {
            this.$toast("刷新失败");
          }
          this.category[active].isLoading = false;
          this.onLoad();
        });
    },
    onScrollTop(e) {
      // 只记录首页的滚动
      if (e.target.scrollTop && this.$route.path === "/") {
        this.scrollTop = e.target.scrollTop;
      }
    },
    onSearch() {
      this.$toast("即将开发");
      // this.$toast(this.keywords);
    },
    onLoad() {
      if (this.category[this.active].isLoading) return;

      if (this.category[this.active].error) {
        this.onRefresh();
      } else {
        this.getData(this.active);
      }
    },
    onRefresh() {
      this.loading = true;
      this.category[this.active].list = [];
      this.category[this.active].finished = false;
      this.category[this.active].previousId = "";
      this.category[this.active].error = false;
      // this.onLoad();
      this.getData(this.active, true);
    }
  }
};
</script>

<style scopen lang="less">
.home {
  & .van-search {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 6;
    transition: 0.3s;
  }

  & .home-tabs-wrap {
    position: absolute;
    width: 100%;
    height: 100%;

    .van-tabs {
      position: absolute;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background: none;

      .van-tab {
        background: #ffffff;
      }

      .van-tabs__wrap {
        position: fixed;
        top: 1.41rem;
        width: 100%;
        z-index: 7;

        .van-tabs__nav {
          background-color: #ffffff00;
        }
      }

      [class*="van-hairline"]::after {
        border: none;
      }

      .van-tabs__content {
        width: 100%;
        height: 100%;
      }

      & .van-tabs__line {
        background-color: #017fff;
      }

      .home-tabs_tab__list {
        position: absolute;
        padding-top: 2.8rem;
        padding-bottom: 1.3333rem;
        width: 100%;
        height: 100%;
        overflow: auto;
        z-index: 5;
        box-sizing: border-box;
        transition: 0.3s;
      }
    }
  }

  .home-article-skeleton {
    margin-bottom: 20px;
    .van-skeleton {
      .van-skeleton__row,
      .van-skeleton__title {
        background-color: #ffffff;
      }
    }

    .van-skeleton__avatar {
      background-color: #ffffff;
    }
  }

  .home-article {
    margin-bottom: 10px;
    width: 100%;
    padding: 8px 10px;
    box-sizing: border-box;
    background: #ffffff;

    .home-article_title-wrap {
      margin-bottom: 5px;

      .home-article_title {
        margin: 0;
        line-height: 1.6;
        font-size: 14px;
        font-weight: bold;
      }

      span {
        flex-shrink: 0;
        flex-grow: 0;
        margin-left: 10px;
        max-width: 2.2rem;
        font-size: 12px;
        color: #999999;
        text-align: right;
      }
    }

    .home-article_pre__l {
      flex: 1;
      .home-article_pre__l___author {
        padding-bottom: 5px;
        height: 0.5rem;
        line-height: 0.5rem;

        .van-image {
          margin-right: 5px;
        }

        .home-article_pre__l___author-name {
          display: inline-block;
          height: 0.5rem;
          font-size: 13px;
          font-weight: bold;
        }
      }

      .home-article_pre__l-paragraph {
        font-size: 13px;
        line-height: 1.6;
        max-height: 1.1rem;
        word-break: break-all;
      }
    }

    .home-article_pre__r {
      width: 2rem;
      height: 1.5rem;
      margin-left: 10px;

      .van-image {
        border-radius: 6px;
        overflow: hidden;
      }
    }

    .home-article_bottom {
      padding: 10px 0 5px;
      // margin-top: 5px;
      color: #999999;

      .van-icon {
        display: inline-block;
        font-size: 18px;
        vertical-align: middle;
      }

      span {
        display: inline-block;
        margin-left: 6px;
        margin-right: 30px;
        font-size: 12px;
      }
    }
  }
}

.home-go-to-Write {
  position: fixed;
  width: 1.2rem;
  height: 1.2rem;
  background: #ffffff;
  right: 20px;
  bottom: 1.8rem;
  z-index: 999;
  border-radius: 100%;
  text-align: center;
  line-height: 1.4rem;
  font-size: 18px;
  color: #ffffff;
  box-shadow: 0px 0px 2px #999999;
  background: #017fff;
  transition: 0.3s;
}

.home-go-to-Write-hide {
  transform: scale(0);
}

// 滚动时隐藏输入框
// .home-wrap {
//   & .van-search {
//     top: -1.4333rem;
//   }

//   & .home-tabs {
//     & .van-tabs {
//       & .van-tabs__wrap {
//         top: 0;
//       }

//       & .home-tabs_tab__list {
//         padding-top: 1.433rem;
//       }
//     }
//   }
// }
</style>
