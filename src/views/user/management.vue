<template>
  <div class="user">
    <div class="user-head">
      <div class="user-head_row">
        <div class="flex">
          <van-image class="user-head_image" round fit="cover" lazy-load :src="user.head_img">
            <template v-slot:loading>
              <van-loading size="20"/>
            </template>
            <template v-slot:error>加载失败</template>
          </van-image>
          <div class="user-head_row__r" v-if="showUpload">
            <van-button round type="default" size="small" color="#666" @click="onUnshowUpload">取消</van-button>
            <van-button round type="info" size="small" @click="handleUpload">完成</van-button>
          </div>
        </div>

        <p class="user-head_name van-ellipsis">{{user.nickname}}</p>
        <van-uploader
          :class="{'show-upload':showUpload}"
          v-model="fileList"
          preview-image
          :max-count="1"
          :after-read="beforeRead"
          @delete="onUnshowUpload"
        />
      </div>
    </div>

    <div class="user-info">
      <van-cell>
        <template slot="title">
          <span class="custom-title">{{user.name}}</span>
        </template>
        <van-tag slot="right-icon" round plain type="success" @click="handleName">账号</van-tag>
      </van-cell>

      <van-cell>
        <template slot="title">
          <span class="custom-title">密码</span>
          <van-icon name="closed-eye"/>
        </template>
        <van-tag slot="right-icon" type="primary" round @click="handleChange(1)">密码</van-tag>
      </van-cell>

      <van-cell>
        <template slot="title">
          <span class="custom-title">{{user.nickname}}</span>
        </template>
        <van-tag slot="right-icon" type="primary" round @click="handleChange(0)">昵称</van-tag>
      </van-cell>

      <van-cell>
        <template slot="title">
          <span class="custom-title">{{sexs[user.sex]}}</span>
        </template>

        <van-tag slot="right-icon" type="primary" round @click="handleChangeSex">性别</van-tag>
      </van-cell>
    </div>

    <van-popup v-model="showPopup" position="bottom">
      <van-picker
        show-toolbar
        title="修改性别"
        :columns="sexs"
        :default-index="sex"
        @cancel="onSexCancel"
        @confirm="onSexConfirm"
      />
    </van-popup>

    <van-dialog
      v-model="showDialog"
      :title="titles[type]"
      show-cancel-button
      :beforeClose="onBeforeClose"
      :closeOnPopstate="true"
      @cancel="onCancel"
      @confirm="onConfirm"
    >
      <div class="user-dialog">
        <!-- 修改昵称 -->
        <van-cell-group v-if="type === 0">
          <van-field
            class="van-hairline--surround"
            v-model.trim="newNickName"
            maxlength="12"
            clearable
            placeholder="请输入昵称"
            :error-message="errormsg0"
          />
        </van-cell-group>
        <!-- 修改密码 -->
        <van-cell-group v-if="type === 1">
          <van-field
            class="van-hairline--surround"
            style="margin-bottom:10px;"
            v-model.trim="password"
            type="password"
            maxlength="12"
            placeholder="请输入原密码"
            required
            clearable
            :error-message="errormsg1"
          />
        </van-cell-group>
        <van-cell-group v-if="type === 1">
          <van-field
            class="van-hairline--surround"
            v-model.trim="newpassword"
            type="password"
            maxlength="12"
            placeholder="请输入新密码"
            required
            clearable
            :error-message="errormsg2"
          />
        </van-cell-group>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import {
  ImagePreview,
  Dialog,
  Uploader,
  Picker,
  Popup,
  Image,
  Field,
  Button,
  Cell,
  CellGroup,
  Loading
} from "vant";
import { mapState, mapMutations } from "vuex";
import { encrypt } from "../../utils/crypto-js";
import VueEvent from "../../utils/VueEvent.js";
import EXIF from "exif-js";
import imgCompress from "../../utils/img-compress.js";
import imgCorrect from "../../utils/img-correct";

export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 通过 `vm` 访问组件实例
      // 获取历史记录
      let URL = document.URL;
      let hash = URL.split("#");
      vm.fromURL = hash[0] + "#" + from.fullPath;
    });
  },
  name: "userManagement",
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Uploader.name]: Uploader,
    [Picker.name]: Picker,
    [Popup.name]: Popup,
    [Image.name]: Image,
    [Field.name]: Field,
    [Button.name]: Button,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Loading.name]: Loading
  },
  data() {
    return {
      showUpload: false,
      fileList: [],
      newHead_img: "",
      type: "",
      showDialog: false,
      titles: ["修改昵称", "修改密码"],
      newNickName: "",
      password: "",
      newpassword: "",
      errormsg0: "",
      errormsg1: "",
      errormsg2: "",
      sexs: ["隐藏", "男", "女"],
      sex: 0,
      showPopup: false,
      fromURL: ""
    };
  },
  computed: {
    ...mapState(["isLogin", "user"])
  },
  mounted() {
    this.sex = this.user.sex;
    // 触发前进后退事件
    VueEvent.$on("popState", triggerPath => {
      triggerPath === this.$route.path && this.popState();
    });
  },
  methods: {
    ...mapMutations(["setUser"]),
    popState() {
      if (this.showDialog) {
        this.showDialog = false;
      }

      if (this.showPopup) {
        this.showPopup = false;
      }
    },
    beforeRead(file) {
      // 修正图片方向
      imgCorrect(EXIF, this.fileList[0].content)
        .then(res => {
          this.fileList[0].content = res.base64;
          this.showUpload = true;
        })
        .catch(err => {
          this.$toast(err.msg);
        });
    },
    handleUpload() {
      // 压缩图片
      imgCompress(this.fileList[0].content, { width: 200 })
        .then(data => {
          this.uploadImg(data.base64);
        })
        .catch(err => {
          this.$toast(err.msg);
          this.onUnshowUpload();
        });

      return true;
    },
    uploadImg(base64) {
      this.$axios
        .post(RESTFULAPI.public.uploadImg, {
          type: "head",
          base64Array: [base64]
        })
        .then(response => {
          this.updataInfo({ head_img: response.data.data.pathArray[0] }, () => {
            this.setUser({
              head_img: BASEURL + response.data.data.pathArray[0]
            });
            this.onUnshowUpload();
          });
        })
        .catch(error => {});
    },
    onUnshowUpload() {
      this.fileList.splice(0, 1);
      this.showUpload = false;
    },
    handleChange(type) {
      // 替换历史记录 往后没有路由，使用此页面路由
      this.$tools.pushState(document.URL, document.URL);
      this.type = type;
      this.showDialog = true;

      if (this.type === 0) {
        this.newNickName = this.user.nickname;
      }
    },
    onCancel() {
      if (this.type === 0) {
        this.newNickName = this.user.nickname;
      }

      if (this.type === 1) {
        this.password = "";
        this.newpassword = "";
      }

      // 关闭弹框，返回到虚拟url的前一页
      this.$router.go(-1);
    },
    // 对话框点击确定
    onConfirm() {
      if (this.type === 0 && this.$tools.isRegNickName(this.newNickName)) {
        this.updataInfo({ nickname: this.newNickName }, () => {
          this.setUser({ nickname: this.newNickName });
        });
      }

      if (
        this.type === 1 &&
        this.password != this.newpassword &&
        this.$tools.isRegPwd(this.newpassword)
      ) {
        this.updataInfo(
          {
            password: encrypt(this.password),
            newpassword: encrypt(this.newpassword)
          },
          () => {
            this.password = "";
            this.newpassword = "";
          }
        );
      }

      // 关闭弹框，返回到虚拟url的前一页
      this.$router.go(-1);
    },
    // 点击对话框确定或取消后的拦截
    onBeforeClose(action, done) {
      // action: cancel confirm

      if (
        this.type === 0 &&
        !this.$tools.isRegNickName(this.newNickName) &&
        action == "confirm"
      ) {
        this.errormsg0 = "昵称是1-12个字符，只能包含中文、字母、数字、下划线";
        done(false); // 取消关闭弹框
        return;
      }

      this.errormsg0 = "";

      if (this.type === 1 && action == "confirm") {
        if (this.password.length < 1) {
          this.errormsg1 = "原密码不能为空";
          done(false);
          return;
        }

        this.errormsg1 = "";

        if (!this.$tools.isRegPwd(this.newpassword)) {
          this.errormsg2 =
            "密码是6-12个字符，只能包含字母、数字、“_”、“-”、“@”";
          done(false);
          return;
        }

        if (this.password == this.newpassword) {
          this.errormsg2 = "原密码与新密码不能相同";
          done(false);
          return;
        }
      }

      this.errormsg2 = "";

      done(); // 关闭弹框
    },
    handleChangeSex() {
      // 替换历史记录
      this.$tools.pushState(document.URL, document.URL);
      this.showPopup = true;
    },
    onSexCancel(e) {
      this.showPopup = false;
      // 关闭弹框，返回到虚拟url的前一页
      this.$router.go(-1);
    },
    onSexConfirm(e) {
      this.updataInfo(
        {
          sex: this.sexs.indexOf(e)
        },
        () => {
          this.setUser({ sex: this.sexs.indexOf(e) });
          this.showPopup = false;
        }
      );

      // 关闭弹框，返回到虚拟url的前一页
      this.$router.go(-1);
    },
    handleName() {
      let n = Math.round(Math.random()),
        msg = ["账号是唯一的，不可以修改", this.user.name];
      this.$toast(msg[n]);
    },
    async updataInfo(data, callback = "") {
      const toast = this.$toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        message: "请求中..."
      });

      await this.$axios
        .put(RESTFULAPI.public.updateInfo, data)
        .then(response => {
          callback && callback();
          // 清除提示
          toast.clear();
          this.$toast(response.data.msg || "修改信息成功");
        })
        .catch(error => {
          // 清除提示
          toast(error.data.msg);
        });
    }
  }
};
</script>

<style scoped lang="less">
@import "../../assets/css/user.less";


.user-head_row {
  position: relative;

  & .user-head_row_uploader {
    opacity: 0.31;
    position: absolute;
    top: 0px;
    left: 0;
    width: 80px;
    height: 160px;
    background: darkcyan;
    border-left: 1px red solid;
    border-right: 1px red solid;
    box-sizing: border-box;
  }

  & .user-head_row__r {
    padding: 0 30px;

    .van-button {
      margin-right: 20px;
    }
  }

  & .van-uploader {
    position: absolute;
    top: 0;
    left: 0;
    width: 80px;
    height: 80px;
    opacity: 0;
    border-radius: 100%;
    border-bottom-right-radius: 0;
    overflow: hidden;
  }

  & .show-upload {
    opacity: 1 !important;
  }
}

.user-info {
  & .custom-title {
    margin-right: 10px;
  }

  .van-cell {
    margin-bottom: 20px;
    padding: 20px 10px;
    background: #f8f8f8;
    font-weight: bold;
    border-radius: 5px;
    & .van-tag {
      height: 0.5rem;
      line-height: 0.5rem;
    }
  }
}

.user-dialog {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;

  .van-field {
    background: #f9f9f9;
  }
}
</style>
