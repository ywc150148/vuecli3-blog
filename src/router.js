import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

Vue.use(Router)

const router = new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: () => import('./views/home/'),
      meta: {
        title: '首页',
        keep_alive: true
      }
    },
    {
      path: '/article/details/:id',
      name: 'articleDetails',
      component: () => import('./views/home/article-details'),
      meta: {
        title: '文章详情'
      }
    },
    {
      path: '/tweet',
      name: 'tweet',
      component: () => import('./views/tweet/'),
      meta: {
        title: '微社区',
        keep_alive: true
      }
    }, {
      path: '/tweet/individual/:authorID',
      name: 'individualTweet',
      component: () => import('./views/tweet/individual'),
      meta: {
        title: '用户-微社区',
      }
    },
    {
      path: '/tweet/write',
      name: 'writeTweet',
      component: () => import('./views/tweet/write'),
      meta: {
        title: '写动态',
        requireAuth: true,
      }
    },
    {
      path: '/tweet/details/:tweetID',
      name: 'tweetDetails',
      component: () => import('./views/tweet/details'),
      meta: {
        title: '用户-微社区-详情',
      }
    },
    {
      path: '/notice',
      name: 'notice',
      component: () => import('./views/notice/'),
      meta: {
        title: '通知'
      }
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('./views/user/'),
      meta: {
        title: '我的',
        keep_alive: true
      }
    },
    {
      path: '/user/management',
      name: 'userManagement',
      component: () => import('./views/user/management'),
      meta: {
        title: '账号管理',
        requireAuth: true,
      }
    },
    {
      path: '/user/set',
      name: 'userSet',
      component: () => import('./views/user/set'),
      meta: {
        title: '设置'
      }
    },
    {
      path: '/view',
      name: 'view',
      component: () => import('./views/view'),
      meta: {
        title: '内容展示'
      }
    },{
      path: '/blog',
      name: 'blog',
      component: () => import('./views/blog/'),
      meta: {
        title: '博客'
      }
    },{
      path: '/blog/write',
      name: 'writeblog',
      component: () => import('./views/blog/write'),
      meta: {
        title: '写博客',
        requireAuth: true,
      }
    },{
      path: '/category',
      name: 'category',
      component: () => import('./views/category/'),
      meta: {
        title: '分类管理'
      }
    },
  ]
})

// 判断是否需要登录权限 以及是否登录
router.beforeEach((to, from, next) => {
  let user = Vue.tools.getStorage("user");
  if (Vue.tools.getStorage('token') && user) {
    store.state.user = user;
    store.state.isLogin = true;
  }

  if (to.matched.some(res => res.meta.requireAuth)) { // 判断是否需要登录权限
    if (store.getters.getisLogin) {
      next();
    } else {
      Vue.toast("请登录后操作");
      next({
        path: '/user',
        query: {
          redirect: to.fullPath
        }
      })
    }
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
})

export default router