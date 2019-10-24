<template>
  <div class="notice">
    <h1>toDdList</h1>
    <div>
      <ul>
        <li v-for="(item,index) in todoList" :key="index">
          <div class="flex-nowrap-between-center">
            <van-tag type="success" v-if="item.status===0">已完成</van-tag>
            <van-tag type="primary" v-if="item.status===1">待开发</van-tag>
            <van-tag v-if="item.status===2">待规划</van-tag>
            <span>{{item.name}}</span>
          </div>

          <van-divider></van-divider>
        </li>
        <li>
          更多...
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Divider } from "vant";

export default {
  name: "",
  mixins: [],
  components: {
    [Divider.name]: Divider
  },
  data() {
    return {
      todoList: {
        reg: {
          name: "用户注册",
          status: 0
        },
        login: {
          name: "用户登录",
          status: 0
        },
        logout: {
          name: "退出登录",
          status: 0
        },
        info: {
          name: "用户信息修改",
          status: 0
        },
        imgCompress: {
          name: "图片压缩，图片显示方向修正",
          status: 0
        },
        uploadImg: {
          name: "多图片上传",
          status: 0
        },
        tweet: {
          name: "用户微社区",
          status: 0
        },
        tweetPost: {
          name: "用户微社区发动态",
          status: 0
        },
        tweetDelte: {
          name: "用户微社区动态删除",
          status: 0
        },
        tweetUser: {
          name: "用户微社区查看",
          status: 0
        },
        tweetComment: {
          name: "用户微社区评论",
          status: 1
        },
        tweetLike: {
          name: "用户微社区点赞",
          status: 1
        },
        blog: {
          name: "用户博客",
          status: 2
        },
        markdown: {
          name: "markdown编辑器",
          status: 2
        },
        socket: {
          name: "WebSocket即时通讯",
          status: 2
        },
        notice: {
          name: "全站消息通知",
          status: 2
        }
      }
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    // this.$toast("即将开发，WebSocekt即时通讯")
    // this.getData();
  },
  destroyed() {},
  methods: {
    getData() {
      this.$axios
        .get(RESTFULAPI.public.users)
        .then(response => {
          console.log("response", response);
        })
        .catch(error => {
          console.log("error", error);
        });
    }
  }
};
</script>

<style scoped lang="less">
.notice {
  padding: 20px;
  background: #ffffff;
}
</style>
