import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import TreeView from "vue-json-tree-view";

Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.use(TreeView);

new Vue({
  render: h => h(App),
}).$mount('#app')
