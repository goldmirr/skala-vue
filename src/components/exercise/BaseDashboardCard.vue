<script setup>
/* =========================================================
   BaseDashboardCard.vue - 공통 박스 디자인 컴포넌트

   검색 박스와 리스트 박스가 똑같은 흰 카드 모양을 쓰고 있어서,
   그 껍데기(테두리/배경/여백/제목 줄)만 따로 떼어냈다.

   안에 무엇이 들어갈지는 전혀 모른다.
   <slot>으로 구멍만 뚫어두고 부모가 채워 넣게 한다.
   ========================================================= */

defineProps({
  // 박스 제목 앞에 붙일 이모지 (없으면 생략된다)
  icon: {
    type: String,
    default: '',
  },
  // 박스 제목
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="box">
    <!-- 제목 줄: 왼쪽은 제목, 오른쪽은 부모가 원하면 채울 수 있는 자리 -->
    <div class="box-head">
      <h3>
        <span v-if="icon" class="icon">{{ icon }}</span>
        {{ title }}
      </h3>

      <!--
        Named Slot - 제목 오른쪽에 뭔가 넣고 싶을 때만 쓰는 선택적 구멍.
        부모가 안 채우면 아무것도 안 나온다 (기본값을 안 적었으므로).
      -->
      <div class="box-action">
        <slot name="action"></slot>
      </div>
    </div>

    <!-- Default Slot - 박스의 본문. 여기에 검색바든 카드 목록이든 들어온다 -->
    <div class="box-body">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
/* 이 박스의 껍데기 디자인만 담당한다 (안쪽 내용의 디자인은 각 컴포넌트 책임) */
.box {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}
/* 제목은 왼쪽, action 슬롯은 오른쪽 끝에 붙도록 */
.box-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
h3 {
  margin: 0;
  font-size: 22px;
}
.icon {
  margin-right: 4px;
}
.box-action {
  font-size: 15px;
  color: #5a6b7d;
}
</style>
