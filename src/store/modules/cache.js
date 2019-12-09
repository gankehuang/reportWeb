import Vue from 'vue'
const cache = {
  state: {
    typeCache: {},
    typeCacheMap : {} // 类型map 用于缓存类型子节点 id: []
  },
  mutations: {
    SET_TYPECACHE: (state, object) => {
      Vue.set(state.typeCache, object.key, object.value)
    },
    SET_TYPECACHE_MAP: (state, object) => {
      Vue.set(state.typeCacheMap, object.key, object.value)
    }
  },
  actions: {
    SETTYPECACHE: ({commit}, object) => {
      commit('SET_TYPECACHE', object)
    },
    SETTYPECACHEMAP: ({commit}, object) => {
      commit('SET_TYPECACHE_MAP', object)
    }
  }
}

export default cache
