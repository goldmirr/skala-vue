<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

// 날씨 단위 설정 스위치 - Pinia configStore와 직접 통신한다
import UnitToggler from '@/components/exercise/UnitToggler.vue'
import ShortcutHelp from '@/components/exercise/ShortcutHelp.vue'

/* =========================================================
   App.vue - 앱 전체 틀

   - <RouterLink> : 내비게이션 바 (주소를 바꾸는 링크)
   - <RouterView> : 현재 주소에 매칭된 페이지가 그려지는 자리

   무엇을 그릴지는 전적으로 라우터(router/index.js)가 결정한다.
   내비게이션은 날씨 대시보드 / 서비스 소개 두 개만 둔다.
   ========================================================= */

// 조작 안내 다이얼로그 열림 여부 (키보드 단축키 자체는 각 View 에서 등록)
const showHelp = ref(false)
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1 class="app-title">🌤 SKALA 날씨 대시보드</h1>
      <p class="app-sub">Vue 3 · Vue Router · Pinia · axios · Element Plus</p>
    </header>

    <!-- ===== 내비게이션 바 =====
         RouterLink는 <a>와 달리 페이지 새로고침 없이 화면만 갈아끼운다 -->
    <nav class="nav-bar">
      <div class="nav-links">
        <RouterLink to="/">🌦 날씨 대시보드</RouterLink>
        <RouterLink to="/about">ℹ️ 서비스 소개</RouterLink>
      </div>

      <div class="nav-tools">
        <!-- 링크가 아니라 전역 설정이므로 RouterLink가 아닌 일반 컴포넌트 -->
        <UnitToggler />
        <el-tooltip content="조작 안내" placement="bottom">
          <el-button circle size="small" @click="showHelp = true">⌨️</el-button>
        </el-tooltip>
      </div>
    </nav>

    <!-- ===== 메인 콘텐츠 영역 =====
         현재 주소에 매칭된 View 컴포넌트가 이 자리에 렌더링된다 -->
    <main class="content">
      <RouterView />
    </main>

    <ShortcutHelp v-model="showHelp" />
  </div>
</template>

<style scoped>
.app-shell {
  width: 800px;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  font-family: sans-serif;
  color: #2c3e50;
}
.app-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 14px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e3eaf2;
}
.app-title {
  margin: 0;
  font-size: 26px;
}
.app-sub {
  margin: 0;
  font-size: 13px;
  color: #8a97a6;
}

/* ===== 내비게이션 바 ===== */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  background-color: white;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.nav-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-bar a {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 15px;
  color: #5a6b7d;
  text-decoration: none;
  white-space: nowrap;
}
.nav-bar a:hover {
  background-color: #f0f5fb;
}
/* 현재 주소와 정확히 일치하는 링크에 라우터가 자동으로 붙여주는 클래스 */
.nav-bar a.router-link-exact-active {
  background-color: #dbe9ff;
  color: #2f6bb5;
  font-weight: bold;
}

/* ===== 메인 콘텐츠 영역 ===== */
.content {
  background: linear-gradient(180deg, #eaf3ff 0%, #f7fbff 100%);
  border-radius: 20px;
  padding: 24px;
}
</style>
