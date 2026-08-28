import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

/* =========================================================
   favoriteStore - 즐겨찾기 도시 저장소

   카드에서 Shift+클릭 또는 우클릭 메뉴로 도시를 즐겨찾기에 넣는다.
   historyStore 와 달리 새로고침해도 남아 있어야 해서
   watch 로 바뀔 때마다 localStorage 에 써둔다.
   ========================================================= */

const STORAGE_KEY = 'skala-vue:favorites'

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export const useFavoriteStore = defineStore('favorite', () => {
  /* ===== State ===== */
  const ids = ref(load())

  /* ===== Getters ===== */
  const count = computed(() => ids.value.length)
  const isFavorite = (id) => ids.value.includes(id)

  /* ===== Actions ===== */
  // 있으면 빼고 없으면 넣는다. 결과(추가됐는지)를 돌려줘서 상태바 문구에 쓴다
  function toggle(id) {
    if (isFavorite(id)) {
      ids.value = ids.value.filter((v) => v !== id)
      return false
    }
    ids.value = [...ids.value, id]
    return true
  }

  function remove(id) {
    ids.value = ids.value.filter((v) => v !== id)
  }

  // 배열이 바뀔 때마다 저장 (deep 없이도 통째로 교체하고 있어서 감지된다)
  watch(ids, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)))

  return { ids, count, isFavorite, toggle, remove }
})
