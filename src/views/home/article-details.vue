<template>
  <div class="article-details">
    <van-nav-bar title="文章详情" left-arrow fixed :border="false" @click-left="pushHref('/')"/>

    <div class="article-details-wrap">
      <div v-if="data">
        <p class="article-details_title">{{data.title}}</p>

        <div class="article-details_head flex-nowrap-between-center">
          <div>
            <div class="flex-nowrap-between-center">
              <van-image
                fit="cover"
                width="0.8rem"
                height="0.8rem"
                round
                lazy-load
                :src="BASEURL+data.authorID.head_img"
              >
                <template v-slot:loading>
                  <van-loading type="spinner" size="20"/>
                </template>
                <template v-slot:error>加载失败</template>
              </van-image>
              <span class="article-details_head__author">{{data.authorID.nickname}}</span>
            </div>
          </div>
          <div @click="$toast('即将开发')">
            <van-button plain type="primary" size="mini">+ 关注</van-button>
          </div>
        </div>
        <div id="blog-details-content" class="article-details_content">
          <mavon-editor
            v-model="data.content"
            :ishljs="true"
            :codeStyle="code_style"
            :subfield="false"
            :defaultOpen="'preview'"
            :toolbarsFlag="false"
            :editable="false"
            :scrollStyle="true"
            ref="md"
          ></mavon-editor>

          <div class="article-details_tag">
            <van-tag type="primary" v-if="data.categoryID">{{data.categoryID.name}}</van-tag>
            <van-tag type="success" v-if="data.subCategoryID">{{data.subCategoryID.name}}</van-tag>
          </div>

          <div class="article-details_content__createtime">发布于： {{data.meta.createAt|dateGet}}</div>
        </div>

        <div class="article-details_reply" v-if="data.reply_count">
          <p class="article-details_reply__title">
            <van-divider>评论</van-divider>
          </p>
          <div
            class="article-details_reply__item"
            v-for="(reply,replyIndex) in data.replies"
            :key="replyIndex"
          >
            <div class="article-details_reply__author flex-center">
              <van-image
                fit="cover"
                width="0.8rem"
                height="0.8rem"
                round
                lazy-load
                :src="reply.author.avatar_url"
              >
                <template v-slot:loading>
                  <van-loading type="spinner" size="20"/>
                </template>
                <template v-slot:error>加载失败</template>
              </van-image>
              <span class="article-details_reply__author___name">{{reply.author.loginname}}</span>
            </div>

            <div class="article-details_reply__content">
              <div v-html="reply.content"></div>
            </div>

            <p class="article-details_reply__time">{{reply.create_at|getTimeAgo}}</p>
            <van-divider v-if="replyIndex!=data.replies.length-1"/>
          </div>
        </div>

        <div class="article-details_bottom flex-nowrap-between-center">
          <div class="article-details_bottom__l" @click="$toast('即将开发')">
            <div>
              <van-icon name="edit"></van-icon>
              <span>写评论...</span>
            </div>
          </div>
          <div class="article-details_bottom__r">
            <div class="flex-nowrap-between-center">
              <div>
                <van-icon name="eye-o"/>
                <span>{{data.views}}</span>
              </div>
              <div @click="onLike">
                <van-icon :name="data.isLike===true?'good-job':'good-job-o'"/>
                <span>{{data.likes}}</span>
              </div>
              <div>
                <van-icon name="chat-o"/>
                <span>{{data.comments}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="home-article-skeleton" v-if="!data && !error">
        <van-skeleton avatar avatar-size="40px" title :row="6"/>
      </div>
      <div v-if="error">出错了...</div>
    </div>

    <van-image-preview v-model="showImagePre" :showIndex="false" :images="images">
      <template v-slot:index>第{{ index }}页</template>
    </van-image-preview>
  </div>
</template>

<script>
import { mavonEditor } from "mavon-editor";
import {
  NavBar,
  Skeleton,
  Divider,
  Image,
  Button,
  Loading,
  ImagePreview
} from "vant";

export default {
  name: "articleDetails",
  mixins: [],
  components: {
    [NavBar.name]: NavBar,
    [Skeleton.name]: Skeleton,
    [Divider.name]: Divider,
    [Image.name]: Image,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [ImagePreview.name]: ImagePreview,
    mavonEditor
  },
  data() {
    return {
      id: "",
      data: "",
      error: false,
      BASEURL,
      code_style: "atelier-estuary-dark",
      showImagePre: false,
      index: 0,
      images: []
    };
  },
  computed: {},
  watch: {},
  created() {
    this.id = this.$route.params.id;
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      this.$axios
        .get(RESTFULAPI.public.blogDetails, {
          params: {
            _id: this.id
          }
        })
        .then(response => {
          this.data = response.data.data;
          document.title = response.data.data.title;
        })
        .catch(error => {
          this.$toast("获取文章详情失败");
          this.error = true;
        });
    },
    clickImg(e) {
      if (e.target.nodeName.toLowerCase() === "img") {
        this.images = [e.target.src];
        this.showImagePre = true;
      }
    },
    onLike() {
      this.$axios
        .put(RESTFULAPI.public.blogLike, {
          _id: this.id
        })
        .then(response => {
          this.data.isLike = response.data.isLike;
          this.data.likes = response.data.likes;
          console.log("response", response);
        })
        .catch(error => {
          console.log("error", error);
        });
    }
  },
  updated() {
    let blog = document.getElementById("blog-details-content");
    if (blog !== null) {
      blog.addEventListener("click", this.clickImg, false);
    }
  },
  destroyed() {
    let blog = document.getElementById("blog-details-content");
    if (blog !== null) {
      blog.removeEventListener("click", this.clickImg, false);
    }
  }
};
</script>

<style scopen lang="less">
.article-details {
  position: relative;

  .article-details-wrap {
    z-index: 3;
    position: fixed;
    top: 1.2rem;
    left: 0;
    padding-top: 0.2rem;
    padding-bottom: 2.4rem;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    background: #ffffff;

    .article-details_title {
      margin: 0;
      padding: 0 10px 0;
      font-size: 1.2em;
      font-weight: bold;
    }

    .article-details_head {
      padding: 8px 10px 0;
      width: 100%;
      box-sizing: border-box;

      .van-image {
        margin-right: 5px;
      }

      .article-details_head__author {
        font-size: 14px;
      }
    }

    .article-details_content {
      width: 100%;
      padding: 10px 5px;
      overflow: auto;
      box-sizing: border-box;

      // .hljs {
      //   padding: 10px 10px;
      //   width: 100%;
      //   overflow: auto;
      //   box-sizing: border-box;

      //   div,
      //   pre {
      //     max-width: 100%;
      //     overflow: auto;
      //   }

      //   img {
      //     display: block;
      //     margin-top: 5px;
      //     max-width: 100%;
      //   }

      //   table tbody {
      //     width: 100%;
      //     overflow: auto !important;
      //   }

      //   table {
      //     border-spacing: 0;
      //     width: 100%;
      //     overflow: auto !important;
      //   }

      //   table {
      //     border: solid #ccc 1px;
      //   }

      //   table td,
      //   table th {
      //     border-left: 1px solid #ccc;
      //     border-top: 1px solid #ccc;
      //     padding: 8px;
      //     text-align: left;
      //   }

      //   table th {
      //     border-top: none;
      //   }

      //   table td:first-child,
      //   table th:first-child {
      //     border-left: none;
      //   }

      //   ol,
      //   ul {
      //     list-style: inherit !important;
      //   }

      //   ul,
      //   ol {
      //     padding: 0;
      //     padding-left: 24px;
      //     margin: 0;
      //   }
      //   li {
      //     line-height: 24px;
      //   }

      //   p,
      //   ul,
      //   ol {
      //     font-size: 16px;
      //     line-height: 24px;
      //   }

      //   ol ol,
      //   ul ol {
      //     list-style-type: lower-roman;
      //   }

      //   ul {
      //     list-style-type: disc !important;
      //   }

      //   ol {
      //     list-style-type: decimal !important;
      //   }
      // }

      .article-details_content__createtime {
        margin-top: 10px;
        padding: 5px;
        font-size: 12px;
        color: #999999;
      }
    }
    .article-details_reply {
      position: relative;
      padding: 10px 0;
      padding-bottom: 2rem;
      width: 100%;
      box-sizing: border-box;

      &::after {
        position: absolute;
        content: "";
        top: 0;
        left: 0;
        width: 100%;
        height: 10px;
        background: #eeeeee;
        z-index: 7;
      }

      .article-details_reply__title {
        text-align: center;
      }

      // .article-details_reply__item {
      //   margin-bottom: 20px;
      //   .article-details_reply__author {
      //     margin-bottom: 10px;
      //     padding: 0 10px;
      //     height: 40px;

      //     .van-image {
      //       margin-right: 5px;
      //     }

      //     .article-details_reply__author___name {
      //       font-size: 14px;
      //     }
      //   }

      //   .article-details_reply__content {
      //     margin: 0 10px;
      //     padding: 10px;
      //     background: #f0f0f0;
      //     border-radius: 3px;

      //     div,
      //     pre {
      //       max-width: 100%;
      //       overflow: auto;
      //     }

      //     img {
      //       display: block;
      //       max-width: 100%;
      //     }

      //     table {
      //       max-width: 100%;
      //     }

      //     p {
      //       margin: auto;
      //       font-size: 14px;
      //     }
      //   }

      //   .article-details_reply__time {
      //     padding: 0 10px;
      //     font-size: 12px;
      //     color: #999999;
      //   }
      // }
    }

    .article-details_tag {
      .van-tag {
        display: inline-block;
        margin-right: 5px;
        height: 14px;
        line-height: 16px;
        vertical-align: middle;
      }
    }
  }

  .van-skeleton {
    .van-skeleton__row,
    .van-skeleton__title {
      background-color: #dddddd;
    }
  }

  .van-skeleton__avatar {
    background-color: #dddddd;
  }

  .article-details_bottom {
    position: fixed;
    z-index: 1600;
    bottom: 0;
    left: 0;
    padding: 5px 10px;
    width: 100%;
    height: 1.2rem;
    box-sizing: border-box;
    background: #ffffff;

    &::after {
      position: absolute;
      box-sizing: border-box;
      content: " ";
      pointer-events: none;
      top: -50%;
      right: -50%;
      bottom: -50%;
      left: -50%;
      border-top: 1px solid #ebedf0;
      -webkit-transform: scale(0.5);
      transform: scale(0.5);
    }

    .article-details_bottom__l {
      & > div {
        padding: 3px 12px;
        height: 0.6rem;
        line-height: 0.6rem;
        text-align: center;
        background: #eeeeee;
        border-radius: 0.6rem;
      }

      .van-icon {
        display: inline-block;
        font-size: 16px;
        vertical-align: middle;
      }

      span {
        display: inline-block;
        margin-left: 6px;
        font-size: 12px;
        vertical-align: middle;
      }
    }

    .article-details_bottom__r {
      line-height: 0.8rem;
      color: #999999;

      .van-icon {
        display: inline-block;
        margin-left: 30px;
        font-size: 18px;
        vertical-align: middle;
      }

      span {
        display: inline-block;
        margin-left: 6px;
        font-size: 12px;
      }
    }
  }
}
</style>
