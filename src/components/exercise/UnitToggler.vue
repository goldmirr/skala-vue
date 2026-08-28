<script setup>
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/configStore'

/* =========================================================
   UnitToggler.vue - 날씨 단위 설정 스위치

   props도 emits도 없다.
   configStore를 직접 가동해서 읽고(action 호출로) 바꾼다.
   이 컴포넌트가 어디에 놓여 있든 상관없는 이유다.

   과제 5 때는 일반 <button> 이었는데 Element Plus 의 el-switch 로 바꿨다.
   el-switch 는 v-model 에 true/false 를 원하는데 store 의 unit 은
   'celsius' / 'fahrenheit' 문자열이라서 v-model 대신
   :model-value(읽기) + @change(쓰기) 로 따로 묶었다.
   ========================================================= */

const configStore = useConfigStore()

/* ⚠️ 자주 하는 실수:
   const { unitSymbol } = configStore   ← 이렇게 그냥 구조분해하면
   반응형 연결이 끊어져서 버튼을 눌러도 화면이 안 바뀐다.
   데이터(state/getters)는 storeToRefs 로, 함수(actions)는 그냥 꺼내도 된다. */
const { unit, unitSymbol, unitLabel } = storeToRefs(configStore)
const { toggleUnit } = configStore
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label">{{ unitLabel }}({{ unitSymbol }})</span>
    <el-switch
      :model-value="unit === 'fahrenheit'"
      inline-prompt
      active-text="℉"
      inactive-text="℃"
      size="large"
      @change="toggleUnit"
    />
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
}
.unit-label {
  font-size: 14px;
  color: #5a6b7d;
}
</style>
