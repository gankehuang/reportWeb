import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import '@/styles/index.scss' // global css
import App from './App'
import router from './router'
import store from './store'
// import 'xe-utils'
import VXEUtils from 'vxe-utils'
import XEUtils from 'xe-utils'
import VXETable from 'vxe-table'
import VXETablePluginElement from 'vxe-table-plugin-element'
import 'vxe-table-plugin-element/dist/style.css'
import 'vxe-table/lib/index.css'
import '@/icons' // icon
import '@/permission' // permission control
axios.defaults.withCredentials = true
Vue.use(VXEUtils, XEUtils, { mounts: ['cookie'] })
Vue.use(VXETable)
VXETable.use(VXETablePluginElement)

Vue.use(ElementUI, { locale })
Vue.use(VXETable)
Vue.config.productionTip = false

Object.defineProperty(Vue.prototype, '$scale', {
    get() {
        return document.documentElement.clientWidth / 1920
    }
})

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})