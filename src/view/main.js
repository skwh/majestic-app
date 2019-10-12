import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';

// Vue.config.productionTip = true;

Vue.use(axios);

new Vue({
  render: h => h(App)
}).$mount('#app')