<template>
  <div class="test">
    <h1>This is an test page</h1>
    <van-button plain type="primary" @click="handelGet">朴素按钮</van-button>
  </div>
</template>

<script>
// @ is an alias to /src
import { Button } from "vant";

export default {
  name: "test",
  mixins: [],
  components: {
    [Button.name]:Button
  },
  props: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    var numbers = [15.5, 2.3, 1.1, 4.7];

    function getSum(total, num) {
      console.log("num", num);
      return total + Math.round(num);
    }
    let n = numbers.reduce(getSum, 0);
    console.log("n:", n);
  },
  destroyed() {},
  methods: {
    handelGet() {
      this.getData();
    },
    getData() {
      this.$axios
        .post(API.public.test, {
          name: "222"
        })
        .then(function(response) {
          console.log("结果：", response.data.a);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>

<style scoped lang="less">
</style>
