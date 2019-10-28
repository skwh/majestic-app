import { shallowMount } from '@vue/test-utils';
import App from '@/view/App.vue';

describe('App', function() {
  const app = shallowMount(App, {
    stubs: ['router-view']
  });

  it('has tests written for it');
})