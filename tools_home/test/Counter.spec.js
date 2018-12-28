import {shallowMount} from '@vue/test-utils';
import Counter from '../src/components/test/Counter.vue';

describe ('Counter.vue', () => {
  it ('计数器在点击按钮时自增', () => {
    const wrapper = shallowMount (Counter);
    wrapper.find ('button').trigger ('click');
    expect (wrapper.find ('div').text ()).toMatch ('1');
  });
});
