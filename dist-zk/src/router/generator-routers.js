import { BasicLayout } from '@/layouts'
import router from '@/router'

/**
 * 过滤没有权限的路由
 * @param {Array} asyncRouterMap 异步路由表
 * @param {Array} roles 权限存在的菜单
 */
export function filterAsyncRouter (asyncRouterMap, roles) {
  return asyncRouterMap.filter(item => {
    if (item.children && item.children.length > 0) {
      item.children = filterAsyncRouter(item.children, roles)
    }
    if (item.meta && item.meta.permission) {
      return item.meta.permission.indexOf(roles) > -1
    } else {
      // 默认没有permission参数即为可访问页面
      return true
    }
  })
}

/**
 * 挂在动态路由
 */
export function mountRoutes (asyncRouterMap, roles) {
  var asyncRoutes = []
  try {
    asyncRoutes = filterAsyncRouter(asyncRouterMap, roles)
  } catch (e) {
    console.log(e)
    asyncRoutes = []
  }
  var main = [
    {
      path: '/',
      name: 'index',
      component: BasicLayout,
      meta: { title: '首页' },
      redirect: asyncRoutes[0] ? asyncRoutes[0].path : '/403',
      children: asyncRoutes
    },
    {
      path: '*',
      redirect: '/404',
      hidden: true
    }
  ]
  router.addRoutes(main)
  return main
}
