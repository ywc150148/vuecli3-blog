<template>
  <div class="user-set">
    <van-button type="default" :disabled="!isLogin" size="large" @click="showDialog=true">退出登录</van-button>

    <van-dialog
      v-model="showDialog"
      title="退出登录？"
      show-cancel-button
      @cancel="showDialog = false"
      @confirm="handlelogOut"
    ></van-dialog>
  </div>
</template>

<script>
import { Dialog } from "vant";
import { mapState, mapMutations } from "vuex";

export default {
  name: "userSet",
  components: {
    [Dialog.Component.name]: Dialog.Component
  },
  data() {
    return {
      showDialog: false
    };
  },
  computed: {
    ...mapState(["isLogin"])
  },
  mounted() {},
  methods: {
    ...mapMutations(["logOut"]),
    handlelogOut() {
      this.getData();
    },
    async getData() {
      try {
        await this.$axios
          .post(RESTFULAPI.public.logOut)
          .then(response => {
            this.$toast("已退出登录");
          })
          .catch(error => {
            this.$toast(error.data.msg|| error || "退出登录发生错误");
          });
      } catch(err) {
        console.log(err)
      }

      this.logOut();
      this.$router.replace("/user");
    }
  }
};
</script>

<style scoped lang="less">
@import "../../assets/css/user.less";

.user-set {
  padding: 30px 20px;
}
</style>
