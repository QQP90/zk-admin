import router from './router'
import store from './store'

import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import { setDocumentTitle, domTitle } from '@/utils/domUtil'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

router.beforeEach(async (to, from, next) => {
  NProgress.start() // start progress bar
  var nextPath = null
  to.meta && (typeof to.meta.title !== 'undefined' && setDocumentTitle(`${to.meta.title} - ${domTitle}`))
  if (to.path === '/403' || to.path === '/404' || to.path === '/500') {
    nextPath = null
  } else {
    // 获取用户数据
    if (!store.state.name) {
      await store.dispatch('GetInfo').catch(
        (e) => {
          console.log(e)
          nextPath = { path: '/500' }
        }
      )
    }
    // 设置权限菜单
    if (store.state.user.name && !store.getters.mountMenu) {
      await store.dispatch('GenerateRoutes', store.state.user.roles).then(() => {
        nextPath = { path: to.fullPath }
      }).catch(
        (e) => {
          nextPath = { path: '/404' }
        }
      )
    }
  }
  if (nextPath && nextPath.path === from.path) {
    NProgress.done()
  }
  nextPath ? next(nextPath) : next()
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
