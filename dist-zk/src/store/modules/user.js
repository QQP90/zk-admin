import { getInfo, logout } from '@/api/login'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: null,
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === 'development') {
          commit('SET_NAME', { name: '测试账号', welcome: welcome() })
          commit('SET_ROLES', 0)
          resolve()
        } else {
          if(localStorage.getItem('UserData')){
              let UserData = JSON.parse(localStorage.getItem('UserData'))
              commit('SET_NAME', { name: UserData.realName, welcome: welcome() })
              commit('SET_ROLES', UserData.sourceType)
              resolve()
              return
          }
          getInfo().then(response => {
            if (response.code === 401) {
              resolve(response)
            } else {
              const result = JSON.stringify(response.data)
              localStorage.setItem("UserData", result);
              let UserData = JSON.parse(result)
              commit('SET_NAME', { name: UserData.realName, welcome: welcome() })
              commit('SET_ROLES', UserData.sourceType)
              resolve(response)
            }
          }).catch(error => {
            reject(error)
          })
        }
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve, reject) => {
        commit('SET_ROLES', null)
        logout().then(() => {
          resolve()
        }).catch((e) => {
          reject(e)
        })
      })
    }

  }
}

export default user
