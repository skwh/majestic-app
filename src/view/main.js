import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ApiRoutes from './api';

// Vue.config.productionTip = true;

Vue.config.devtools = !PRODUCTION;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')