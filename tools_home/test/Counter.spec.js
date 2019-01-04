import {shallowMount, mount, createLocalVue} from '@vue/test-utils';
import Counter from '../src/components/test/Counter.vue';
import moxios from 'moxios';
import axios from 'axios';
import sinon from 'sinon';
var spy = sinon.spy ();
describe ('Counter.vue-计数器', () => {
  beforeEach (function () {
    // moxios.install ();
  });

  afterEach (function () {
    // moxios.uninstall ();
  });
  it ('renders a div', done => {
    // moxios.stubRequest ('/say/hello', {
    //   status: 200,
    //   responseText: '12',
    // });
    // const wrapper = mount (Counter, {});
    // wrapper.find ('#opp').trigger ('click');
    // setTimeout (() => {
    //   expect (wrapper.find ('#opp').text ()).toBe ('12');
    //   done ();
    // });
  });
});
