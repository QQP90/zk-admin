import axios from 'axios'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import store from "../store"
import message from 'ant-design-vue/es/message'

// 创建 axios 实例
const service = axios.create({
//   baseURL: process.env.VUE_APP_API_BASE_URL,
  baseURL: '/api/v1',
  timeout: 30000, // 请求超时时间
  withCredentials: true
})

const err = (error) => {
  if (error.response) {
    store.state.loadding = false
    const data = error.response.data
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 500) {
      notification.error({
        message: '服务器请求失败',
        description: data.message
      })
    }
    // 规定了返回数据的结构
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
    }
  }
  return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use(config => {
  store.state.loadding = true; //在请求发出之前进行一些操作
  return config

}, err)

// response interceptor
service.interceptors.response.use((response) => {
  const data = response.data
  store.state.loadding = false
  //在这里对返回的数据进行处理
  if (data && data.code && data.code !== 200) {
    switch (data.code) {
      case 401:
        window.location = 'https://uid.39.net/home/login?projectUrl=http://zk-mg-test.39.net/&refUrl=http://zk-mg-test.39.net/'
        return data
    }
    // message.error(data.message)
    return Promise.reject(data)
  } else if (data && data.code && data.code === 200) {
    return data
  } else {
  
    return Promise.reject(data)
  }
}, err)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, service)
  }
}

export {
  installer as VueAxios,
  service as axios
}
