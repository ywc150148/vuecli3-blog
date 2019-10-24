<template>
  <div class="login-popup">
    <div class="login-popup_box">
      <p>账号注册</p>
      <van-cell-group :border="false">
        <van-field
          v-model="name"
          maxlength="12"
          clearable
          :error-message="errormsg0"
          placeholder="请输入账号"
        />
        <van-field
          v-model="password"
          type="password"
          maxlength="12"
          :error-message="errormsg1"
          clearable
          placeholder="请输入密码"
        />
        <van-button type="primary" size="large" @click="handleReg">注册</van-button>
      </van-cell-group>
      <van-row type="flex" justify="space-between">
        <van-col>
          <p class="login-popup_box_link" @click="switchToLogin">登录</p>
        </van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
import { encrypt } from "../../utils/crypto-js";

export default {
  inject: ["switchToLogin", "handleClosed"],
  data() {
    return {
      name: "",
      password: "",
      errormsg0: "",
      errormsg1: ""
    };
  },
  mounted() {},
  methods: {
    handleReg() {
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

      this.signUp();
    },
    signUp() {
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
        .post(RESTFULAPI.public.signUp, data)
        .then(response => {
          toast.clear();

          this.$toast(response.data.msg || "注册成功");
          this.switchToLogin();
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
