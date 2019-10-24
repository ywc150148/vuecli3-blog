<template>
  <div class="view">
    <ul>
      <h2>技术栈</h2>
      <h3>前端</h3>
      <li>Vue全家桶</li>
      <li>Vant组件库</li>
      <li>Es6</li>
      <li>Less</li>
      <h3>后端</h3>
      <li>node.js + Koa2框架</li>
      <li>MongoDB + Mongoose</li>
      <li>pm2进程管理</li>
      <li></li>
      <h3>服务器</h3>
      <li>Linux CentOS7</li>
      <li>Nginx代理服务器</li>
      <h3>编辑器</h3>
      <li>Visual Studio Code</li>
      <h3>其他</h3>
      <li>
        <p>这是一个独自开发的项目，目前规划好待实现的功能有多用户博客，多用户社区，即时消息通知，多用户即时通讯。</p>
        <p>目前只完成了小部分功能，用户状态管理前端用的是vuex和localStorage。后端使用路由拦截、中间件验证JWT、用户token匹配。</p>
        <p>目前还在开发中，能做出什么全靠百度。</p>
        <p>...</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "",
  mixins: [],
  components: {},
  data() {
    return {};
  },
  watch: {},
  created() {},
  mounted() {
    console.log("路由", this.$route);
  },
  destroyed() {},
  methods: {}
};
</script>

<style scoped lang="less">
.view {
  padding: 20px;
  background: #ffffff;
}
</style>
