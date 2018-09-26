import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
const state = {
  count: 10,
  todos: [
    { id: 1, text: '...', done: true },
    { id: 2, text: '...', done: false }
  ]
}
const actions = {
  increment: ({ commit }) => { commit('increment') },
  decrement: ({ commit }) => { commit('decrement') },
  incrementAsyns({commit},ply){
		setTimeout(function(){
			commit('increment',ply);
		},1000)
	}
}
const mutations = {
  increment(state,peloy) {
    state.count = state.count + peloy.cou;
  },
  decrement(start) {
    state.count = state.count - 3;
  }

}
const getters = {
	doneTodos:state=>{
		return state.todos.filter(todo=>todo.done)
	},
	doneTodosCount:(state,getters)=>{
		return getters.doneTodos.length
	},
	getTodoById:state=>id=>{
		return state.todos.filter(todo=>todo.id == id);
	}
}

export default new Vuex.Store({
  state,
  actions,
  mutations,
  getters
})
