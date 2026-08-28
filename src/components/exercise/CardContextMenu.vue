<script setup>
import { computed } from 'vue'

/* =========================================================
   CardContextMenu.vue - 카드 우클릭 메뉴

   WeatherCard 에서 @click.right.prevent 로 열린다.
   메뉴 자체는 <Teleport> 로 body 바로 아래에 붙여서
   부모 카드의 overflow: hidden 에 잘리지 않게 했다.

   닫히는 경우
   - 메뉴 바깥 클릭 (@click.self)
   - 바깥에서 다시 우클릭 (@click.right.prevent.self)
   - 메뉴 항목 선택
   - Esc (이건 부모 페이지의 단축키에서 처리)
   ========================================================= */

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  city: {
    type: Object,
    default: null,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'action'])

// 화면 오른쪽/아래 끝에서 우클릭하면 메뉴가 잘리니까 안쪽으로 밀어준다
const MENU_W = 220
const MENU_H = 200
const position = computed(() => ({
  left: `${Math.min(props.x, window.innerWidth - MENU_W - 8)}px`,
  top: `${Math.min(props.y, window.innerHeight - MENU_H - 8)}px`,
}))

const pick = (action) => emit('action', action)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && city"
      class="menu-backdrop"
      @click.self="emit('close')"
      @click.right.prevent.self="emit('close')"
    >
      <ul class="ctx-menu" :style="position">
        <li class="ctx-title">{{ city.icon }} {{ city.name }}</li>
        <li @click="pick('detail')">🔎 상세보기</li>
        <li @click="pick('favorite')">
          {{ isFavorite ? '☆ 즐겨찾기 해제' : '⭐ 즐겨찾기 추가' }}
        </li>
        <li @click="pick('copy')">📋 날씨 요약 복사</li>
        <!-- 검색으로 추가한 도시만 지울 수 있다 (기본 5개는 고정) -->
        <li v-if="city.custom" class="danger" @click="pick('remove')">🗑 목록에서 제거</li>
      </ul>
    </div>
  </Teleport>
</template>

<style scoped>
/* 화면 전체를 덮는 투명 막. 여기를 클릭하면 메뉴가 닫힌다 */
.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
}
.ctx-menu {
  position: fixed;
  width: 220px;
  margin: 0;
  padding: 6px 0;
  list-style: none;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  font-size: 15px;
  color: #2c3e50;
  animation: pop 0.12s ease-out;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.ctx-menu li {
  padding: 9px 16px;
  cursor: pointer;
}
.ctx-menu li:hover {
  background-color: #f0f5fb;
}
.ctx-title {
  font-weight: bold;
  color: #5a6b7d;
  border-bottom: 1px solid #eef2f7;
  cursor: default !important;
}
.ctx-title:hover {
  background-color: transparent !important;
}
.danger {
  color: #c0392b;
}
</style>
