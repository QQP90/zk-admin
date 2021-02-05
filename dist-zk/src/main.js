// ie polyfill
import '@babel/polyfill'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import { VueAxios } from './utils/request'
import Bus from '@/lib/bus'     // 引入Bus组件
Vue.prototype.$bus = Bus
// mock
// import './mock'
import $ from 'jquery'
import bootstrap from './core/bootstrap'
import './core/use'
import './permission' // permission control
import './utils/filter' // global filter
// Distpicker
import Distpicker from 'v-distpicker'
// 百度地图
import BaiduMap from 'vue-baidu-map'
Vue.component('v-distpicker', Distpicker)
Vue.config.productionTip = false
Vue.use(BaiduMap, {
  /* 需要注册百度地图开发者来获取你的ak */
  ak: 'QDGgkDZpn6jxVHDTGnH7PHutQ89kquhK'
})
// mount axios Vue.$http and this.$http
Vue.use(VueAxios)

new Vue({
  router,
  store,
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
