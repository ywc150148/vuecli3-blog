<template>
  <div></div>
</template>

<script>
export default {
  name: "",
  mixins: [],
  components: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {
    // DOM 更新循环结束之后执行延迟回调
    this.$nextTick(function() {
      // ...
    });
  },
  mounted() {},
  destroyed() {},
  methods: {}
};
</script>

<style scoped lang="less">
</style>
