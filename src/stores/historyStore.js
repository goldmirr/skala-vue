import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/* =========================================================
   historyStore - [요구사항 4] 내가 추가한 Store

   상세 페이지를 방문한 기록을 쌓아두는 저장소.

   상세 페이지(WeatherDetailView)가 기록을 넣고,
   메인 대시보드(WeatherHomeView)가 기록을 보여준다.
   두 페이지는 라우팅으로 완전히 갈아끼워지는 사이지만
   Store의 데이터는 페이지 이동과 상관없이 살아남는다.
   ========================================================= */
export const useHistoryStore = defineStore('history', () => {
  /* ===== 1) State ===== */
  // 방문 기록 배열 (최신 방문이 맨 앞)
  const records = ref([])

  /* ===== 2) Getters ===== */
  const visitCount = computed(() => records.value.length)
  // 화면에는 최근 3건만 보여준다
  const recentRecords = computed(() => records.value.slice(0, 3))

  /* ===== 3) Actions ===== */
  function addRecord(city) {
    // 같은 도시를 다시 보면 옛 기록을 지우고 맨 앞으로 끌어올린다
    records.value = records.value.filter((record) => record.id !== city.id)
    records.value.unshift({
      id: city.id,
      name: city.name,
      icon: city.icon,
      time: new Date().toLocaleTimeString(),
    })
  }

  function clearHistory() {
    records.value = []
  }

  return { records, visitCount, recentRecords, addRecord, clearHistory }
})
