<template>
  <div id="app">
    <app-navigation></app-navigation>
    <main>
      <router-view />
    </main>
    <app-footer></app-footer>
  </div>
</template>

<script>
import AppNavigation from './components/Navigation.vue';
import AppFooter from './components/Footer.vue';

export default {
  name: 'app',
  components: {
    AppNavigation,
    AppFooter
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed:700|Roboto:400,700&display=swap');

html, body {
  margin: 0;
  padding: 0;
}

div#app {
  font-family: "Roboto", sans-serif;
  width: 50vw;
  margin: auto;
}
</style>