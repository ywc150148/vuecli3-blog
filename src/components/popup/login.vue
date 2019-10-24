<template>
  <div class="login-popup">
    <div class="login-popup_box">
      <p>账号登录</p>
      <van-cell-group :border="false">
        <van-field
          v-model.trim="name"
          maxlength="12"
          clearable
          :error-message="errormsg0"
          placeholder="请输入账号"
        />
        <van-field
          v-model.trim="password"
          type="password"
          maxlength="12"
          clearable
          :error-message="errormsg1"
          placeholder="请输入密码"
        />
        <van-button type="primary" size="large" @click="handleLogin">登录</van-button>
      </van-cell-group>
      <van-row type="flex" justify="space-between">
        <van-col>
          <p class="login-popup_box_link" @click="switchToReg">注册</p>
        </van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

import { encrypt } from "../../utils/crypto-js";

export default {
  inject: ["switchToReg", "handleClosed"],
  data() {
    return {
      name: "",
      password: "",
      errormsg0: "",
      errormsg1: ""
    };
  },
  computed: {},
  methods: {
    ...mapMutations(["loGin"]),
    handleLogin() {
      // if (this.name.length < 1) {
      //   this.errormsg0 = "账号不能为空";
      //   return;
      // } else if (!this.$tools.isRegName(this.name)) {
      //   this.errormsg0 = "只能输入6-12位字母数字“_”、“-”组合的字符";
      //   return;
      // }

      // this.errormsg0 = "";

      // if (this.password.length < 1) {
      //   this.errormsg1 = "密码不能为空";
      //   return;
      // } else if (!this.$tools.isRegPwd(this.password)) {
      //   this.errormsg1 = "只能输入6-12位字母、数字、“.”、“*”、“#”、“$”、“@”";
      //   return;
      // }

      // this.errormsg1 = "";

      if (!this.$tools.isRegName(this.name)) {
        this.errormsg0 = "账号是2-12个字符，只能包含字母、数字、下划线";
        return;
      }

      this.errormsg0 = "";

      if (!this.$tools.isRegPwd(this.password)) {
        this.errormsg1 = "密码是6-12个字符，只能包含字母、数字、“_”、“-”、“@”";
        return;
      }

      this.errormsg1 = "";
      this.logIn();
      return;

      // const toast = this.$toast.loading({
      //   duration: 0, // 持续展示 toast
      //   forbidClick: true, // 禁用背景点击
      //   loadingType: "spinner",
      //   message: "倒计时 1 秒"
      // });

      // let second = 1;
      // const timer = setInterval(() => {
      //   second--;
      //   if (second) {
      //     toast.message = `倒计时 ${second} 秒`;
      //   } else {
      //     clearInterval(timer);
      //     // 清除提示
      //     toast.clear();
      //     // 登录
      //     this.$store.commit("loGin");
      //     // 关闭弹出层
      //     this.handleClosed();
      //     // 登录
      //     this.$tools.setStorage("token", "abkkj4j3jj3l4m=");
      //     this.$tools.setStorage("user", {
      //       name: "Rocher",
      //       nickname: "紫菜骑士1997",
      //       head_img: "https://img.yzcdn.cn/vant/cat.jpeg",
      //       sex: "1"
      //     });

      //     this.$store.state.user = this.$tools.getStorage("user");

      //     this.loGin();
      //   }
      // }, 1000);
    },
    logIn() {
      const toast = this.$toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        message: "加载..."
      });

      // 加密
      let data = {
        name: encrypt(this.name),
        password: encrypt(this.password),
        mode: "aes-256-cbc"
      };

      this.$axios
        .post(RESTFULAPI.public.logIn, data)
        .then(response => {
          toast.clear();
          response.data.data.user.head_img =
            BASEURL + response.data.data.user.head_img;

          //  登录
          this.$tools.setStorage("token", response.data.data.token);
          this.$tools.setStorage("user", response.data.data.user);
          this.$store.state.user = response.data.data.user;
          this.loGin();
          this.handleClosed();
          this.$toast(response.data.msg || "登录成功");
        })
        .catch(error => {
          toast.clear();
          this.$toast(error.data.msg || "请求失败");
        });
    }
  }
};
</script>

<style scoped lang="less">
.login-popup {
  position: absolute;
  padding-top: 50px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  & .login-popup_box {
    position: absolute;
    top: 50px;
    left: 50%;
    margin-left: -120px;
    padding: 20px 0;
    width: 240px;

    & .van-cell-group {
      background: none;
    }

    & .van-field {
      margin-bottom: 10px;
      background: #f5f5f5;
    }

    & .van-button {
      margin-bottom: 10px;
      height: 1rem;
      line-height: 1rem;
    }

    & .login-popup_box_link {
      color: #007fff;
      font-size: 14px;
    }
  }
}
</style>
