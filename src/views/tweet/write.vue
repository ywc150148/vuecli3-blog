<template>
  <div class="tweet-write">
    <van-nav-bar
      left-arrow
      fixed
      :border="false"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <van-button type="primary" size="small" slot="right">发送</van-button>
    </van-nav-bar>
    <div class="tweet-write-wrap">
      <van-cell-group>
        <van-field
          v-model="content"
          rows="4"
          :border="false"
          type="textarea"
          maxlength="300"
          show-word-limit
          placeholder="请输入你想说的..."
        />
      </van-cell-group>
      <div class="tweet-write-uploader">
        <van-uploader
          v-model="fileList"
          multiple
          :max-count="9"
          preview-size="115"
          :after-read="onAfterRead"
        ></van-uploader>
      </div>
    </div>
  </div>
</template>

<script>
import {
  NavBar,
  Uploader,
  Dialog,
  Field,
  Button,
  Loading,
  CellGroup
} from "vant";
import EXIF from "exif-js";
import imgCompress from "../../utils/img-compress.js";
import imgCorrect from "../../utils/img-correct";
import { mapState, mapMutations } from "vuex";

export default {
  name: "",
  components: {
    [NavBar.name]: NavBar,
    [Uploader.name]: Uploader,
    [Field.name]: Field,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [CellGroup.name]: CellGroup
  },
  data() {
    return {
      content: "",
      fileList: [],
      unSend: true,
      pathArray: []
    };
  },
  computed: {
    ...mapState(["isLogin", "user"])
  },
  created() {},
  mounted() {
    // 草稿
    const tweetDraft = this.$tools.getStorage("tweetDraft");
    if (tweetDraft !== null && tweetDraft.user.name == this.user.name) {
      this.content = tweetDraft.content;
      this.fileList = tweetDraft.fileList;
    }
  },
  destroyed() {},
  beforeDestroy() {},
  beforeRouteLeave(to, from, next) {
    to.meta.newData = !this.unSend;
    next();
  },
  methods: {
    onClickLeft() {
      const flag = this.content != "" || this.fileList.length > 0;
      // 保存草稿
      if (this.unSend === true && flag === true && this.isLogin === true) {
        Dialog.confirm({
          title: "是否保存草稿？"
        })
          .then(() => {
            this.$tools.setStorage("tweetDraft", {
              user:this.user,
              content: this.content,
              fileList: this.fileList
            });
            this.$router.replace("/tweet");
          })
          .catch(() => {
            // 确定删除，刷新页面销毁时不会保存
            this.$tools.removeStorage("tweetDraft");

            this.$router.replace("/tweet");
          });
      } else {
        this.$router.replace("/tweet");
      }
    },
    onClickRight() {
      if (this.content == "") return this.$toast("请输入你想说的...");

      if (this.fileList.length > 0) {
        let imgArr = new Array();

        this.fileList.forEach((item, index) => {
          imgArr.push(item.content);
        });

        const toast = this.$toast.loading({
          duration: 0,
          forbidClick: true, // 禁用背景点击
          loadingType: "spinner",
          content: "上传图片..."
        });

        this.$axios
          .post(RESTFULAPI.public.uploadImg, {
            type: "tweet",
            base64Array: imgArr
          })
          .then(response => {
            // 清除提示
            toast.clear();
            this.pathArray = response.data.data.pathArray;
            if (
              Object.prototype.toString.call(this.pathArray) !==
                "[object Array]" ||
              this.pathArray.length < 1
            ) {
              this.pathArray = [];
            }

            this.postTweet(this.content, this.pathArray);
          })
          .catch(error => {
            // 清除提示
            toast.clear();
            this.$toast(error.data.msg);
          });
      } else {
        this.postTweet(this.content);
      }
    },
    postTweet(content, images = "") {
      this.$axios
        .post(RESTFULAPI.public.tweetPost, {
          content,
          images
        })
        .then(response => {
          this.unSend = false;
          this.$toast(response.data.msg);
          this.$tools.removeStorage("tweetDraft");
          this.pushHref("/tweet");
        })
        .catch(error => {
          this.$toast(error.data.msg);
        });
    },
    async onAfterRead(file) {
      const index = this.fileList.length - 1;

      // 修正图片方向
      await imgCorrect(EXIF, file.file)
        .then(res => {
          this.fileList[index].content = res.base64;
        })
        .catch(err => {
          this.$toast(err.msg);
        });

      // 图片压缩
      imgCompress(this.fileList[index].content)
        .then(data => {
          this.fileList[index].content = data.base64;
        })
        .catch(err => {
          this.$toast(err.msg);
        });

      return true;
    }
  }
};
</script>

<style scoped lang="less">
.tweet-write {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  // background: #d87575;
  padding-top: 1.2rem;
  overflow-y: auto;
  box-sizing: border-box;

  .tweet-write-wrap {
    [class*="van-hairline"]::after {
      border: none;
    }
  }
}
</style>
