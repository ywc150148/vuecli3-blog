<template>
  <div class="home" :class="{'home-wrap':isScroll}">
    <van-search v-model="keywords" placeholder="请输入搜索关键词" show-action @search="onSearch">
      <div slot="action" @click="onSearch">搜索</div>
    </van-search>

    <div class="home-tabs-wrap home-tabs">
      <van-tabs v-model="active" animated>
        <van-tab v-for="(item,cat_index) in category" :key="cat_index" :title="item.tab">
          <div class="home-tabs_tab__list">
            <van-pull-refresh
              v-model="category[cat_index].isLoading"
              :disabled="!category[cat_index].list.length"
              @refresh="onRefresh"
            >
              <!-- 分类页 -->
              <van-list
                v-model="loading"
                :error.sync="category[cat_index].error"
                error-text="请求失败，点击重新加载"
                :finished="category[cat_index].finished"
                :finished-text="finished_text"
                @load="onLoad"
              >
                <!-- 骨架屏 -->
                <div class="home-article-skeleton" v-show="!category[cat_index].list.length">
                  <van-skeleton
                    v-for="skeleton in 4"
                    :key="skeleton"
                    avatar
                    avatar-size="40px"
                    title
                    :row="4"
                  />
                </div>

                <!-- 文章预览 -->
                <div
                  class="home-article"
                  v-for="(item,index) in category[cat_index].list"
                  :key="index"
                  @click="pushHref('/article/details/'+item.id)"
                >
                  <div class="home-article_title">{{item.title}}</div>
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
                            :src="item.author_head"
                          >
                            <template v-slot:loading>
                              <van-loading type="spinner" size="20"/>
                            </template>
                            <template v-slot:error>加载失败</template>
                          </van-image>
                        </div>

                        <div class="home-article_pre__l___author-name">{{item.author}}</div>
                      </div>

                      <div class="home-article_pre__l-paragraph line-clamp-2">{{item.paragraph}}</div>
                    </div>
                    <div class="home-article_pre__r" v-if="item.hasImg">
                      <van-image
                        fit="cover"
                        width="2.3rem"
                        height="1.6rem"
                        lazy-load
                        :src="item.image"
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
                      <div>
                        <van-icon name="good-job-o"/>
                        <span>{{item.lick}}</span>
                      </div>
                      <div>
                        <van-icon name="chat-o"/>
                        <span>{{item.comment}}</span>
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
  </div>
</template>

<script>
import { Search, Tab, Tabs, List, PullRefresh, Skeleton } from "vant";
import { setTimeout } from "timers";

export default {
  name: "",
  mixins: [],
  components: {
    [Search.name]: Search,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [List.name]: List,
    [PullRefresh.name]: PullRefresh,
    [Skeleton.name]: Skeleton
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
      scrollTop: "",
      isScroll: false,
      isLoading: false
    };
  },
  computed: {},
  watch: {
    scrollTop(n, o) {
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
        .get(API.public.category)
        .then(response => {
          this.category = response.data.data;
          this.category.forEach(item => {
            item.list = [];
            item.finished = false;
            item.error = false;
            item.isLoading = false;
          });
          this.finished_text = "没有更多了";
        })
        .catch(error => {
          this.$toast("获取分类失败");
        });
    },
    getData(active) {
      this.$axios
        .get(API.public.article_list + "/" + this.category[active].id)
        .then(response => {
          let data = response.data.data;
          this.category[active].list = [...this.category[active].list, ...data];
          this.loading = false;

          if (this.category[active].list.length >= 30) {
            this.category[active].finished = true;
          }

          if (this.category[active].isLoading === true) {
            this.category[active].isLoading = false;
            this.$toast("刷新成功");
          }

          this.category[active].error = false;
        })
        .catch(error => {
          this.category[active].error = true;
          if (this.category[active].isLoading === true) {
            this.$toast("刷新失败");
            this.category[active].isLoading = false;
          }
        });
    },
    onScrollTop(e) {
      if (e.target.scrollTop) {
        this.scrollTop = e.target.scrollTop;
      }
    },
    onSearch() {
      this.$toast(this.keywords);
    },
    onLoad() {
      this.getData(this.active);
    },
    onRefresh() {
      this.category[this.active].list = [];
      this.category[this.active].finished = false;
      this.loading = true;
      this.onLoad();
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

    .home-article_title {
      margin-bottom: 5px;
      line-height: 1.6;
      font-size: 14px;
      font-weight: bold;
    }

    .home-article_pre__l {
      flex: 1;
      .home-article_pre__l___author {
        height: 0.5rem;
        line-height: 0.5rem;

        .van-image {
          margin-right: 5px;
        }

        .home-article_pre__l___author-name {
          font-size: 13px;
          font-weight: bold;
        }
      }

      .home-article_pre__l-paragraph {
        font-size: 13px;
        line-height: 1.6;
        max-height: 1.1rem;
      }
    }

    .home-article_pre__r {
      margin-left: 2px;

      .van-image {
        border-radius: 3px;
        overflow: hidden;
      }
    }

    .home-article_bottom {
      margin-top: 5px;
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
