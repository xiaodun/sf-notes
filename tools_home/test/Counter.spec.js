import {shallowMount, mount} from '@vue/test-utils';
import Counter from '../src/components/test/Counter.vue';

describe('Counter.vue-计数器', () => {
  describe('Foo', () => {
    it('renders a div', () => {
      const wrapper = mount(Counter, {
        propsData: {
          bar: 'baz',
        },
      });
      // expect(wrapper.props().bar).toBe('baz');
      wrapper.vm.increment();
      expect(wrapper.text()).toMatch('1');
    });
  });
});
