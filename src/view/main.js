import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import router from './router';

// Vue.config.productionTip = true;

Vue.config.devtools = process.env.NODE_ENV === 'development'

// Vue.use(axios);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')