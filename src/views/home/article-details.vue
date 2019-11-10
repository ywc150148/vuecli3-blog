<template>
  <div id="blog-details" class="blog-details article-details">
    <van-nav-bar title="文章详情" left-arrow fixed :border="false" @click-left="pushHref('/')"/>

    <div class="article-details-wrap">
      <div v-if="data">
        <p class="article-details_title">{{data.title}}</p>

        <div class="article-details_head flex-nowrap-between-center">
          <div>
            <div class="flex-nowrap-between-center">
              <van-image
                class="blog-details-authorID_head_img"
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

        <!-- 评论列表 -->
        <div class="article-details_reply" v-if="commentList.length>0">
          <p class="article-details_reply__title">
            <van-divider>评论</van-divider>
          </p>

          <van-list
            v-model="loading"
            :finished="finished"
            :error.sync="error"
            error-text="请求失败，点击重新加载"
            @load="getComment"
          >
            <div
              class="article-details_reply__item"
              v-for="(reply,replyIndex) in commentList"
              :key="replyIndex"
            >
              <div class="article-details_reply__author flex-center">
                <van-image
                  fit="cover"
                  width="0.8rem"
                  height="0.8rem"
                  round
                  lazy-load
                  :src="BASEURL + reply.reviewer.head_img"
                >
                  <template v-slot:loading>
                    <van-loading type="spinner" size="20"/>
                  </template>
                  <template v-slot:error>加载失败</template>
                </van-image>
                <span class="article-details_reply__author___name">{{reply.reviewer.nickname}}</span>
              </div>

              <div class="blog-reply-target-user flex-center" v-if="reply.targetUser">
                <span>@{{reply.targetUser.nickname}}</span>
              </div>

              <div class="article-details_reply__content">
                <mavon-editor
                  v-model="reply.content"
                  :ishljs="true"
                  :codeStyle="code_style"
                  :subfield="false"
                  :defaultOpen="'preview'"
                  :toolbarsFlag="false"
                  :editable="false"
                  :scrollStyle="true"
                  ref="md"
                ></mavon-editor>
              </div>
              <div class="article-details_reply__time flex-nowrap-between-center">
                <p>{{reply.meta.createAt|getTimeAgo}}</p>
                <p class="article-details_reply-btn" @click="onWriteComment(reply)">评论</p>
              </div>
              <van-divider v-if="replyIndex!=commentList.length-1"/>
            </div>
          </van-list>
        </div>

        <van-divider v-if="finished||commentList.length<0" @click="getComment(true)">点击获取最新评论</van-divider>

        <div class="article-details_bottom flex-nowrap-between-center">
          <div class="article-details_bottom__l" @click="onWriteComment">
            <div>
              <van-icon name="edit"></van-icon>
              <span>写评论...</span>
            </div>
          </div>
          <div class="article-details_bottom__r">
            <div class="flex-nowrap-between-center">
              <div>
                <van-icon name="eye-o"/>
                <span>{{data.views|totalQuantity}}</span>
              </div>
              <div @click="onLike">
                <van-icon :name="data.isLike===true?'good-job':'good-job-o'"/>
                <span>{{data.likes|totalQuantity}}</span>
              </div>
              <div>
                <van-icon name="chat-o"/>
                <span>{{data.comments|totalQuantity}}</span>
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

    <van-popup v-model="showPopup" position="bottom">
      <div>
        <div class="article-details-van-popup_nav flex-nowrap-between-center">
          <van-icon name="cross" @click="showPopup = false"/>
          <p @click="post">发送</p>
        </div>
        <mavon-editor
          v-model="comment"
          :toolbars="toolbars"
          :ishljs="true"
          codeStyle="atelier-estuary-dark"
          :scrollStyle="true"
          :subfield="false"
          :defaultOpen="'edit'"
          :placeholder="'输入评论...'"
          ref="commentmd"
          @imgAdd="imgAdd"
          @save="post"
        ></mavon-editor>
      </div>
    </van-popup>
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
  ImagePreview,
  Popup,
  List
} from "vant";
import { mapState, mapMutations } from "vuex";
import EXIF from "exif-js";
import imgCompress from "../../utils/img-compress.js";
import imgCorrect from "../../utils/img-correct.js";
import "mavon-editor/dist/css/index.css";

export default {
  name: "articleDetails",
  inject: ["handleShowLogin"],
  components: {
    [NavBar.name]: NavBar,
    [Skeleton.name]: Skeleton,
    [Divider.name]: Divider,
    [Image.name]: Image,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [ImagePreview.name]: ImagePreview,
    [Popup.name]: Popup,
    [List.name]: List,
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
      images: [],
      showPopup: false,
      comment: "",
      toolbars: {
        link: true, // 链接
        imagelink: true, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: true, // 全屏编辑
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: true, // 保存（触发events中的save事件）
        subfield: true, // 单双栏模式
        preview: true // 预览
      },
      previousId: "",
      commentList: [],
      BASEURL,
      loading: false,
      error: false,
      finished: false,
      mainCommentID: "",
      targetUser: ""
    };
  },
  computed: {
    ...mapState(["isLogin", "user"])
  },
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
          this.getComment();
        })
        .catch(error => {
          this.$toast("获取文章详情失败");
          this.error = true;
        });
    },
    getComment(flag = false) {
      // 在没有评论或者所有评论加载完毕后点击，flag:ture
      if (flag) this.loading = true;

      this.$axios
        .get(RESTFULAPI.public.blogComment, {
          params: {
            blogID: this.id,
            limit: 10,
            previousId: this.previousId
          }
        })
        .then(response => {
          this.commentList = this.commentList.concat(response.data.data);
          this.previousId = response.data.previousId;
          this.finished = response.data.nomore;
          this.loading = false;

          if (flag === true && response.data.nomore) {
            this.$toast("没有更多的评论");
          }
        })
        .catch(error => {
          this.$toast("获取博客评论失败");
          this.error = true;
        });
    },
    clickImg(e) {
      if (e.target.nodeName.toLowerCase() === "img") {

        // 此页面中只有头像使用了van-img，除了头像以外的图片都可以预览
        let index = Array.from(e.target.classList).findIndex(item => {
          return item == "van-image__img";
        });

        if (index > -1) return;

        this.images = [e.target.src];
        this.showImagePre = true;
      }
    },
    onWriteComment(reply = "") {
      if (!this.isLogin) {
        this.handleShowLogin();
      }

      // 继承主评论的id或继承子评论的父评论的id(后端判断处理)
      this.mainCommentID = reply != "" ? reply._id : "";

      this.showPopup = true;
    },
    post() {
      if (this.$tools.isNull(this.comment)) {
        return this.$toast("请输入评论");
      }

      const toast = this.$toast.loading({
        duration: 0,
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        content: "文章发布中"
      });

      this.$axios
        .post(RESTFULAPI.public.blogComment, {
          _id: this.id,
          content: this.comment,
          mainCommentID: this.mainCommentID,
          targetUser: this.targetUser
        })
        .then(response => {
          this.showPopup = false;
          this.comment = "";
          this.mainCommentID = "";
          this.$toast(response.data.msg);
          this.commentList.unshift(response.data.data);
          this.data.comments = response.data.comments;
          this.$toast(response.data.msg);
        })
        .catch(error => {
          // 清除提示
          toast.clear();
          this.$toast(error.data.msg);
        });
    },
    async imgAdd(pos, file) {
      let base64 = "",
        url;
      // 修正图片方向
      await imgCorrect(EXIF, file.miniurl)
        .then(res => {
          base64 = res.base64;
        })
        .catch(err => {
          this.$toast(err.msg);
        });

      await imgCompress(base64)
        .then(data => {
          base64 = data.base64;
        })
        .catch(err => {
          this.$toast(err.msg);
        });

      const toast = this.$toast.loading({
        duration: 1000,
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        content: "上传图片..."
      });

      this.$axios
        .post(RESTFULAPI.public.uploadImg, {
          type: "blog",
          base64Array: [base64]
        })
        .then(response => {
          // 清除提示
          toast.clear();
          url = response.data.data.pathArray[0];
          this.$refs.commentmd.$img2Url(pos, BASEURL + url);
        })
        .catch(error => {
          // 清除提示
          toast.clear();
          this.$refs.commentmd.$img2Url(pos, "图片上传失败");
          this.$toast(error.data.msg);
        });
    },
    onLike() {
      if (!this.isLogin) {
        this.handleShowLogin();
      }

      this.$axios
        .put(RESTFULAPI.public.blogLike, {
          _id: this.id
        })
        .then(response => {
          this.data.isLike = response.data.isLike;
          this.data.likes = response.data.likes;
        })
        .catch(error => {});
    }
  },
  updated() {
    // let blog = document.getElementById("blog-details-content");
    let blog = document.getElementById("blog-details");

    if (blog !== null) {
      blog.addEventListener("click", this.clickImg, false);
    }
  },
  destroyed() {
    // let blog = document.getElementById("blog-details-content");
    let blog = document.getElementById("blog-details");
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

  .article-details-van-popup_nav {
    padding: 10px 10px;
    font-size: 14px;
    color: #888888;

    p {
      margin: 0;
    }
  }
}

.blog-details {
  .article-details_reply__item {
    .article-details_reply__content {
      padding: 0;
      background: none;
    }

    .van-divider {
      margin: 5px 0;
    }

    .blog-reply-target-user {
      padding: 0 10px;
      color: #569cd6;
      font-size: 14px;
    }
  }
}
</style>
