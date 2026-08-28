<script setup>
/* =========================================================
   ShortcutHelp.vue - 키보드/마우스 조작 안내 다이얼로그

   App.vue 의 ⌨️ 버튼으로 열린다.
   Vue 3.4+ 의 defineModel 로 열림/닫힘 상태를 부모와 v-model 로 묶었다.
   (props + emit('update:modelValue') 를 한 줄로 줄여주는 매크로)
   ========================================================= */
const visible = defineModel({ type: Boolean, default: false })

const SHORTCUTS = [
  { keys: '/', desc: '검색창으로 포커스 이동', where: '대시보드' },
  { keys: 'Enter', desc: '첫 번째 검색 결과 선택 / 결과 없으면 도시 추가 여부 확인', where: '검색창' },
  { keys: 'Esc', desc: '검색어 지우기 · 선택 해제 · 메뉴 닫기 · 상세에서 메인으로', where: '어디서나' },
]

const MOUSE = [
  { keys: '클릭', desc: '카드 선택' },
  { keys: '더블클릭', desc: '상세 페이지로 이동' },
  { keys: '오른쪽 클릭', desc: '카드 메뉴 열기 (상세보기 / 즐겨찾기 / 복사 / 제거)' },
]
</script>

<template>
  <el-dialog v-model="visible" title="⌨️ 조작 안내" width="520px" align-center>
    <h4 class="group-title">키보드</h4>
    <el-table :data="SHORTCUTS" size="small" stripe>
      <el-table-column label="키" width="150">
        <template #default="{ row }">
          <kbd>{{ row.keys }}</kbd>
        </template>
      </el-table-column>
      <el-table-column prop="desc" label="동작" />
      <el-table-column prop="where" label="위치" width="100" />
    </el-table>

    <h4 class="group-title">마우스 (날씨 카드)</h4>
    <el-table :data="MOUSE" size="small" stripe>
      <el-table-column label="조작" width="150">
        <template #default="{ row }">
          <kbd>{{ row.keys }}</kbd>
        </template>
      </el-table-column>
      <el-table-column prop="desc" label="동작" />
    </el-table>
    <p class="note">카드에 마우스를 올리면 흑백 사진이 컬러로 바뀌고, 선택하면 완전한 컬러가 됩니다.</p>

    <template #footer>
      <el-button type="primary" @click="visible = false">닫기</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.group-title {
  margin: 12px 0 8px;
  font-size: 15px;
  color: #5a6b7d;
}
.group-title:first-child {
  margin-top: 0;
}
.note {
  margin: 10px 0 0;
  font-size: 13px;
  color: #8a97a6;
}
kbd {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid #d5dde8;
  border-bottom-width: 2px;
  border-radius: 5px;
  background-color: #f7f9fc;
  font-family: inherit;
  font-size: 13px;
}
</style>
