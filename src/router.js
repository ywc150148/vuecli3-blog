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
    },{
      path: '/tweet/individual/:authorID',
      name: 'individualTweet',
      component: () => import('./views/tweet/individual'),
      meta: {
        title: '用户-微社区',
      }
    },
    {
      path: '/tweet/write',
      name: 'write',
      component: () => import('./views/tweet/write'),
      meta: {
        title: '写动态',
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
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./views/about'),
      meta: {
        title: 'about'
      }
    }
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