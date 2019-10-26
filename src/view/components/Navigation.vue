<template>
  <nav>
    <div v-for="(page, i) in pages" v-bind:key="i">
      <router-link v-bind:to="page.path">{{ page.name }}</router-link>
    </div>
  </nav>  
</template>

<script>
export default {
  name: 'AppNavigation',
  data() {
    return {
      pages: [
        {
          name: 'Home',
          path: '/'
        },
        {
          name: 'Download',
          path: '/download'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
nav {
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
  margin-bottom: 2%;

  div {
    display: inline-block;
    padding: 2%;
    
    a {
      color: black;
      text-decoration: none;

      &:visited {
        color: black;
      }

      &.router-link-active {
        color: grey;
      }
    }

    &:hover {
      cursor: pointer;
      background-color:rgba(0, 0, 0, 0.1);
      a {
        color: grey;
      }
    }
  }
}
</style>