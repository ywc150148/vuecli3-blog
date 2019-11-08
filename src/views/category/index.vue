<template>
  <div class="category">
    <van-nav-bar
      title="博客分类管理"
      left-text
      right-text="添加"
      :border="false"
      :z-index="5"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
    />
    <h3>添加分类</h3>
    <div>
      <van-field
        v-model="name"
        maxlength="20"
        rows="1"
        required
        right-icon="question-o"
        placeholder="请输入分类名称"
        @click-right-icon="$toast('标题：1-20个字符')"
      />
    </div>

    <div>
      <h3>全部分类</h3>
      <div v-for="(item,index) in list" :key="index">
        <van-cell-group :title="''+(index+1)">
          <van-cell
            :title="item.name"
            :value="statusText[item.status]"
            icon="cluster-o"
            @click="onItem(item)"
          >
            <van-icon slot="right-icon" name="setting-o" style="line-height: inherit;"/>
          </van-cell>

          <van-cell
            :title="sub.name"
            :value="statusText[sub.status]"
            v-for="(sub,subindex) in item.subCategoryID"
            :key="subindex"
            @click="onItem(sub)"
          >
            <van-icon slot="right-icon" name="setting-o" style="line-height: inherit;"/>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <van-popup
      class="category-van-popup"
      v-model="showPopup"
      :close-on-popstate="true"
      position="bottom"
      v-if="showItem"
    >
      <div class="category-van-popup_nav flex-nowrap-between-center">
        <van-icon name="cross" @click="showPopup = false"/>
        <p v-show="!isAddSub" @click="put">保存</p>
        <p v-show="isAddSub" @click="addSub">添加</p>
      </div>
      <p style="text-align:center">
        <span v-if="showItem.isMainCategory">
          <van-icon name="cluster-o"/>
        </span>
        {{showItem.name}}
      </p>
      <div class="category-van-popup_content" v-show="!isAddSub">
        <van-radio-group class="flex-nowrap-around-center" v-model="showItem.status">
          <van-radio :name="0">发布</van-radio>
          <van-radio :name="1">审核</van-radio>
          <van-radio :name="2">隐藏</van-radio>
          <van-radio :name="3">删除</van-radio>
        </van-radio-group>

        <van-field
          v-model="showItem.name"
          maxlength="20"
          rows="1"
          required
          right-icon="question-o"
          placeholder="请输入分类名称"
          @click-right-icon="$toast('标题：1-20个字符')"
        />

        <div class="category-van-popup_content__index flex-nowrap-between-center">
          <p>排序</p>
          <van-stepper v-model="showItem.index" integer min="0" max="100"/>
        </div>

        <van-button
          class="category-van-popup_addsub__btn"
          :disabled="!showItem.isMainCategory"
          type="primary"
          @click="isAddSub=true"
        >添加子分类</van-button>
      </div>
      <div class="category-van-popup_addsub" v-show="isAddSub">
        <van-field
          v-model="name"
          maxlength="20"
          rows="1"
          required
          right-icon="question-o"
          placeholder="请输入子分类名称"
          @click-right-icon="$toast('标题：1-20个字符')"
        />
        <van-button
          class="category-van-popup_addsub__btn"
          type="primary"
          @click="isAddSub=false"
        >编辑主分类</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import {
  NavBar,
  Field,
  Cell,
  CellGroup,
  Popup,
  RadioGroup,
  Radio,
  Stepper,
  Button
} from "vant";

export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 通过 `vm` 访问组件实例
      if (from.path === "/") vm.fromPath = "/";
    });
  },
  name: "category",
  mixins: [],
  components: {
    [NavBar.name]: NavBar,
    [Field.name]: Field,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Popup.name]: Popup,
    [RadioGroup.name]: RadioGroup,
    [Radio.name]: Radio,
    [Stepper.name]: Stepper,
    [Button.name]: Button
  },
  data() {
    return {
      name: "",
      index: 0,
      cover: "",
      mainCategoryID: "",
      fromPath: "",
      list: [],
      showPopup: false,
      showItem: "",
      isAddSub: false,
      statusText: ["", "审核", "隐藏", "删除"]
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.getData();
  },
  methods: {
    onItem(item, isAddSub = false) {
      this.name = "";
      this.isAddSub = false;
      this.showItem = JSON.parse(JSON.stringify(item));
      this.showPopup = true;
    },
    getData() {
      this.$axios
        .get(RESTFULAPI.public.category)
        .then(response => {
          this.list = response.data.data;
        })
        .catch(error => {});
    },
    put() {
      this.$axios
        .put(RESTFULAPI.public.category, {
          _id: this.showItem._id,
          name: this.showItem.name,
          status: this.showItem.status,
          index: this.showItem.index,
          cover: this.showItem.cover
        })
        .then(response => {
          this.reset();
        })
        .catch(error => {});
    },
    reset() {
      this.getData();
      this.name = "";
      this.showItem = "";
      this.isAddSub = false;
      this.showPopup = false;
      this.mainCategoryID = "";
    },
    addSub() {
      this.mainCategoryID = this.showItem._id;
      this.onClickRight();
    },
    onClickLeft() {
      if (this.fromPath == "/") {
        // 非此站跳转来源，点击返回回到首页
        this.pushHref(this.fromPath);
      } else {
        this.$router.go(-1);
      }
    },
    onClickRight() {
      if (this.$tools.isNull(this.name)) {
        return this.$toast("请输入分类名称");
      }

      this.$axios
        .post(RESTFULAPI.public.category, {
          name: this.name,
          index: this.index,
          cover: this.cover,
          mainCategoryID: this.mainCategoryID
        })
        .then(response => {
          this.reset();
        })
        .catch(error => {
          this.$toast(error.data.msg);
        });
    }
  }
};
</script>

<style scoped lang="less">
h3 {
  margin-bottom: 5px;
  padding: 0 5px;
}
.category-van-popup {
  p {
    margin: 0;
    text-align: center;
    span {
      font-size: 12px;
    }
  }

  .category-van-popup_nav {
    padding: 10px;
    p {
      margin: 0;
      font-size: 14px;
    }
  }

  .category-van-popup_content {
    min-height: 2rem;

    .van-radio-group {
      padding: 20px 10px;
    }

    .category-van-popup_content__index {
      padding: 20px 10px;
    }
  }

  .category-van-popup_addsub__btn {
    display: block;
    margin: 10px auto;
  }
}
</style>
