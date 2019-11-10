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
        <h5>2019/11/10 22:50 更新</h5>
        <p>实现博客评论，只做了2级评论</p>
        <p>猪肉还是很贵。</p>
        <hr>
        <h5>2019/11/08 22:30 更新</h5>
        <p>使用mavon-editor作为博客编辑器，完成了用户博客发文章，文章分类，文章详情</p>
        <p>最近在找工作，感觉以前在外包做的项目不顶用，简历石沉大海。</p>
        <hr>
        <h5>2019/10/31 18:57 更新</h5>
        <p>实现评论回复</p>
        <hr>
        <h5>2019/10/31 15:55 更新</h5>
        <p>
          手机点击物理返回键或者浏览器触发返回、前进事件，
          如果图片、组件处于预览、显示等状态时，只关闭预览、显示，不进行页面跳转。
        </p>
        <p>优化了一下写动态的页面。</p>
        <hr>
        <h5>2019/10/30 22:37 更新</h5>
        <p>
          微社区实现了评论、点赞，目前评论只做了一层评论，其实已经做好二层评论的模型，并没有对接二层评论，最麻烦的嵌套评论也可以实现，不过数据查询会慢点。目前的微社区的功能会升级
          然后使用到博客上，做微社区其实是在为博客做准备。
        </p>
        <hr>
        <h5>2019/10/24 更新</h5>
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
    // console.log("路由", this.$route);
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
