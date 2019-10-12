import Vue from 'vue';
import Router from 'vue-router';

import Home from './pages/Home.vue';
import Download from './pages/Download.vue';

Vue.use(Router);

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/download',
      component: Download
    }
  ]
})