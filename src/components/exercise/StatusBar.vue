<script setup>
/* =========================================================
   StatusBar.vue - [요구사항 7] 내가 추가로 분리한 컴포넌트

   상태 문구만 담당하는 아주 작은 컴포넌트.
   받은 문구를 그대로 보여주기만 하고, 이벤트도 없고 내부 상태도 없다.
   이런 컴포넌트를 Presentational Component(표현 전용)라고 부른다.

   원래는 페이지 맨 아래 있어서 카드를 고르고 나서 스크롤을 내려야 문구가
   보였다. position: sticky 로 화면 하단에 붙여서 어디를 보고 있든 보이게 했다.
   ========================================================= */

defineProps({
  message: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <p class="status-bar">{{ message }}</p>
</template>

<style scoped>
.status-bar {
  /* 화면 하단 고정. 페이지 끝에 있는 요소라 스크롤 위치와 상관없이 뷰포트 아래에 붙는다 */
  position: sticky;
  bottom: 12px;
  z-index: 10;
  margin: 0;
  padding: 14px 18px;
  border-radius: 12px;
  background-color: #2c3e50;
  color: white;
  text-align: center;
  font-size: 17px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
</style>
