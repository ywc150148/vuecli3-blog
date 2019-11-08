<template>
  <div class="blog">
    <van-nav-bar
      title="写博客"
      left-text
      :border="false"
      :z-index="5"
      left-arrow
      @click-left="onClickLeft"
    />
    <div class="blog-row">
      <div @click="pushHref('/blog/write')">写博客</div>
      <div @click="pushHref('/category')">分类管理</div>
    </div>
  </div>
</template>

<script>
import { NavBar, Field } from "vant";

export default {
  name: "blog",
  mixins: [],
  components: {
    [NavBar.name]: NavBar,
  },
  data() {
    return {
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped lang="less">
.blog {
  .blog-row {
    margin: 20px;
  }
}
</style>
