import Vue from 'vue'
import { Layout, Menu, Icon, Breadcrumb } from 'ant-design-vue'
import App from './App.vue'

Vue.use(Layout)
Vue.use(Menu)
Vue.use(Icon)
Vue.use(Breadcrumb)
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
