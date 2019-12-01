<template>
  <header>
    <div id="logo">
      <a href="https://www.du.edu" title="University of Denver">
        <img :src="this.logoUrl" alt="University of Denver Logo">
      </a>
      <h1>Denver Air Quality Monitoring</h1>
    </div>
    <nav>
      <router-link v-for="(page, i) in pages" v-bind:key="i" v-bind:to="page.path">{{ page.name }}</router-link>
    </nav>
  </header>
</template>

<script>
import DuLogo from '../../public/du-logo.png';

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
          name: 'Download Data',
          path: '/download'
        }
      ],
      logoUrl: DuLogo,
    }
  }
}
</script>

<style lang="scss">

header {
  text-align: center;
  margin: 1vw;

  img {
    width: 50%;
  }

  h1 {
    margin:1vh 0;
    font-family: "Roboto Condensed", "Roboto", sans-serif;
  }
}

nav {
  margin-bottom: 2%;
  display: flex;
  justify-content: center;
  align-items: center;

  a {
    display: inline-block;
    padding: 2%;

    text-decoration: none;
    color: black;

    &:visited {
      color: black;
    }

    &.router-link-active {
      font-weight: bold;
    }

    &:hover {
      cursor: pointer;
      background-color:rgba(0, 0, 0, 0.1);
      color: grey;
    }
  }
}
</style>