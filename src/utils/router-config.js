import router from '../router'
import store from '../store'

router.beforeEach((to, from, next) => {
    // 设置标题
    if (to.meta.title) {
      document.title = to.meta.title
    }
  
    console.log("store",store.state.isLogin)
  
    next() // 必须使用 next ,执行效果依赖 next 方法的调用参数
  });

  