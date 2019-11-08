<template>
  <div class="blog">
    <van-nav-bar
      class="tweet-individual-navbar"
      title="写博客"
      left-text
      right-text="发布"
      :border="false"
      :z-index="5"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
    />
    <div>
      <van-field
        v-model="title"
        maxlength="100"
        :autosize="{ maxHeight: 80}"
        rows="1"
        required
        right-icon="question-o"
        type="textarea"
        placeholder="请输入标题"
        @click-right-icon="$toast('标题：1-100个字符')"
      />
    </div>
    <div class="blog-category">
      <van-cell-group>
        <van-cell
          title="选择分类"
          is-link
          :arrow-direction="showPopup?'down':''"
          :value="categoryIndex"
          @click="showPopup=!showPopup"
        />
      </van-cell-group>
    </div>
    <mavon-editor
      v-model="doc"
      :ishljs="true"
      :codeStyle="code_style"
      :toolbarsBackground="'#000'"
      ref="editor"
      @save="saveDoc"
      @change="updateDoc"
      @imgAdd="imgAdd"
      @imgDel="imgDel"
    ></mavon-editor>
    <van-popup v-model="showPopup" position="bottom">
      <van-cell-group>
        <van-cell
          title="选择分类"
          is-link
          :arrow-direction="showPopup?'down':''"
          value="关闭"
          @click="showPopup=false"
        />
      </van-cell-group>
      <van-radio-group v-model="categoryID" class="flex-between-center">
        <van-radio :name="item._id" v-for="item in category" :key="item._id">{{item.name}}</van-radio>
      </van-radio-group>

      <div class="blog-van-popup-subCategory van-hairline--top">
        <p v-if="activeItem.length">子分类（可选）</p>
        <div class="blog-van-popup-subCategory_box" v-if="activeItem.length">
          <van-radio-group v-model="subCategoryID" class="flex-between-center">
            <van-radio name checked-color="#ddd">不选</van-radio>
            <van-radio
              :name="subitem._id"
              checked-color="#07c160"
              v-for="subitem in activeItem"
              :key="subitem._id"
            >{{subitem.name}}</van-radio>
          </van-radio-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import {
  NavBar,
  Field,
  Cell,
  CellGroup,
  RadioGroup,
  Radio,
  Popup,
  Dialog
} from "vant";
import { mavonEditor } from "mavon-editor";
import EXIF from "exif-js";
import imgCompress from "../../utils/img-compress.js";
import imgCorrect from "../../utils/img-correct.js";
import "mavon-editor/dist/css/index.css";

import { mapState, mapMutations } from "vuex";

export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 通过 `vm` 访问组件实例
      if (from.path === "/") vm.fromPath = "/";
    });
  },
  name: "blog",
  mixins: [],
  components: {
    [NavBar.name]: NavBar,
    [Field.name]: Field,
    [RadioGroup.name]: RadioGroup,
    [Radio.name]: Radio,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Popup.name]: Popup,
    mavonEditor
  },
  data() {
    return {
      title: "",
      doc: "",
      cover: "",
      imgList: [],
      categoryID: "",
      subCategoryID: "",
      code_style: "atelier-estuary-dark",
      toolbars: {
        readmodel: false
      },
      fromPath: "",
      unSend: true,
      category: [],
      // subCategory: [],
      showPopup: false
    };
  },
  computed: {
    ...mapState(["isLogin", "user"]),
    categoryIndex() {
      let subName = "";
      let arr = this.category.find(item => {
        if (
          item._id == this.categoryID &&
          this.subCategoryID != "" &&
          item.subCategoryID.length > 0
        ) {
          item.subCategoryID.forEach(sub => {
            if (sub._id == this.subCategoryID) {
              subName = "/" + sub.name;
              return;
            }
          });

          return true;
        } else {
          return item._id == this.categoryID;
        }
      });

      return arr === undefined ? "请选择分类" : arr.name + subName;
    },
    activeItem() {
      let arr = [];
      this.subCategoryID = "";
      this.category.forEach(element => {
        if (this.categoryID == element._id) {
          if (element.subCategoryID.length > 0) {
            arr = element.subCategoryID;
          }
        }
      });

      return arr;
    }
  },
  watch: {},
  created() {},
  mounted() {
    // 关闭沉浸阅读
    this.$refs.editor.toolbars.readmodel = false;
    this.getCategory();

    // 草稿
    const blogDraft = this.$tools.getStorage("blogDraft");
    if (blogDraft !== null && blogDraft.user.name == this.user.name) {
      this.title = blogDraft.title;
      this.doc = blogDraft.doc;
    }
  },
  methods: {
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
        duration: 0,
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
          this.$refs.editor.$img2Url(pos, BASEURL + url);
        })
        .catch(error => {
          // 清除提示
          toast.clear();
          this.$refs.editor.$img2Url(pos, "图片上传失败");
          this.$toast(error.data.msg);
        });
    },
    imgDel(fileName) {},
    updateDoc(markdown, html) {
      let reg = /(?:!\[(.*?)\]\((.*?)\))/g,
        data,
        arr = [];
      // 获取所有图片
      while ((data = reg.exec(markdown))) {
        data[2] != "图片上传失败" && data[2].length > 1 && arr.push(data[2]);
      }
      this.imgList = Array.from(new Set(arr));
      this.cover = this.imgList.length > 0 ? this.imgList[0] : "";
    },
    saveDoc(markdown, html) {
      this.post();
    },
    async onClickLeft() {
      const flag = this.title != "" || this.doc != "";
      if (this.unSend === true && flag) {
        await Dialog.confirm({
          title: "是否保存草稿？"
        })
          .then(() => {
            this.$tools.setStorage("blogDraft", {
              user: this.user,
              title: this.title,
              doc: this.doc
            });
          })
          .catch(() => {
            // 删除
            this.$tools.removeStorage("blogDraft");
          });
      }

      if (this.fromPath == "/") {
        // 非此站跳转来源，点击返回回到首页
        this.pushHref(this.fromPath);
      } else {
        this.$router.go(-1);
      }
    },
    onClickRight() {
      this.post();
    },
    post() {
      if (!this.unSend) {
        return this.$toast("请不要重复发布");
      } else if (this.$tools.isNull(this.title)) {
        return this.$toast("请输入标题");
      } else if (this.$tools.isNull(this.doc)) {
        return this.$toast("请输入内容");
      } else if (this.categoryID == "") {
        this.showPopup = true;
        return this.$toast("请选择分类");
      }

      const toast = this.$toast.loading({
        duration: 0,
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        content: "文章发布中"
      });

      this.$axios
        .post(RESTFULAPI.public.blog, {
          title: this.title,
          content: this.doc,
          cover: this.cover,
          categoryID: this.categoryID,
          subCategoryID: this.subCategoryID
        })
        .then(response => {
          // 清除提示
          toast.clear();
          this.unSend = false;
          if (this.fromPath == "/") {
            // 非此站跳转来源，点击返回回到首页
            this.pushHref(this.fromPath);
          } else {
            this.$router.go(-1);
          }
        })
        .catch(error => {
          // 清除提示
          toast.clear();
          this.$toast(error.data.msg);
        });
    },
    getCategory() {
      this.$axios
        .get(RESTFULAPI.public.category)
        .then(response => {
          this.category = response.data.data;
        })
        .catch(error => {});
    }
  },
  beforeRouteLeave(to, from, next) {
    to.meta.newData = !this.unSend;
    next();
  }
};
</script>

<style scoped lang="less">
.blog-category {
  background: #ffffff;
}
.van-popup {
  .van-radio-group {
    padding: 10px;
    .van-radio {
      margin: 5px 0;
      flex-basis: 50%;
    }
  }

  .blog-van-popup-subCategory {
    padding: 5px 0 0;
    height: 2.8rem;

    p {
      margin: 0;
      padding: 2px 10px;
      height: 0.3rem;
      font-size: 14px;
      color: #888888;
    }

    .blog-van-popup-subCategory_box {
      height: 2.4rem;
      overflow-y: auto;
    }
  }
}
</style>
