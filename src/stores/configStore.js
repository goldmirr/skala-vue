import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/* =========================================================
   configStore - 날씨 단위 등 앱 전역 설정 저장소

   Props/Emits는 부모-자식 사이만 오갈 수 있지만,
   Store는 컴포넌트 계층과 상관없이 어디서든 꺼내 쓸 수 있다.
   (UnitToggler는 App.vue에, 기온 표시는 카드/상세 페이지에 있어도
    같은 unit 값을 바라보게 되는 이유)

   식별자는 use + 파일명 + Store 규칙 → useConfigStore
   ========================================================= */
export const useConfigStore = defineStore('config', () => {
  /* ===== 1) State - ref()로 만드는 전역 반응형 데이터 ===== */
  // 단위를 저장하는 변수 (celsius / fahrenheit)
  const unit = ref('celsius')

  /* ===== 2) Getters - computed()로 만드는 읽기 전용 가공 값 ===== */
  // 현재 단위 상태에 맞는 기호
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '°C' : '°F'))

  // [요구사항 4] 내가 추가한 getter - 토글 버튼 옆에 표시할 한글 이름
  const unitLabel = computed(() => (unit.value === 'celsius' ? '섭씨' : '화씨'))

  /* ===== 3) Actions - state를 바꾸는 함수 =====
     컴포넌트에서 unit.value를 직접 고칠 수도 있지만,
     변경 로직을 action으로 모아두면 "누가 언제 바꿨는지" 추적이 쉽다 */
  // 'celsius'와 'fahrenheit'를 토글(스위칭)하는 함수
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  /* ===== [요구사항 4] 내가 추가한 함수 - 단위 변환기 =====
     메인 카드와 상세 페이지가 똑같은 화씨 변환식을 각자 들고 있으면
     코드가 중복되므로, 변환 공식을 store 한 곳에 모아뒀다.
     (강의 자료의 "Composable로 해결 가능" 부분을 store 함수로 해결한 것) */
  function convertTemp(rawCelsius) {
    if (unit.value === 'fahrenheit') {
      return Math.round((rawCelsius * 9) / 5 + 32) // 화씨 변환 연산
    }
    return rawCelsius // 'celsius'일 때는 원본 그대로 반환
  }

  // 외부 컴포넌트가 쓸 수 있도록 개방(Expose)
  return { unit, unitSymbol, unitLabel, toggleUnit, convertTemp }
})
