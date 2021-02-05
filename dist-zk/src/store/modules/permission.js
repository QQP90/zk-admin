import { asyncRouterMap, constantRouterMap } from '@/config/router.config'
import { mountRoutes } from '@/router/generator-routers'

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    mountMenu: false
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.mountMenu = true
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes ({ commit }, roles) {
      return new Promise(resolve => {
        const accessedRouters = mountRoutes(asyncRouterMap, roles)
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  },
  getters: {
    mountMenu: state => state.mountMenu
  }
}

export default permission
