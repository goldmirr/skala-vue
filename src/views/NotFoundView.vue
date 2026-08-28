<script setup>
import { useRoute } from 'vue-router'

/* =========================================================
   NotFoundView.vue - 정의되지 않은 경로 접근 시 (Catch-all)

   라우터의 /:pathMatch(.*)* 패턴에 걸려서 오는 페이지.
   어떤 라우트에도 매칭되지 않은 주소는 전부 여기로 흘러들어온다.
   ========================================================= */

// 사용자가 무엇을 잘못 쳤는지 보여주기 위해 현재 주소를 읽는다
const route = useRoute()
</script>

<template>
  <div class="page">
    <div class="notfound-box">
      <p class="big-icons">🌞 ❓</p>
      <h3>페이지를 찾을 수 없습니다.</h3>
      <p class="desc">
        요청하신 주소 <code>{{ route.fullPath }}</code> 는 존재하지 않거나,<br />
        아직 개발되지 않았습니다.
      </p>
      <RouterLink to="/" class="home-btn">날씨 메인으로 이동</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page {
  font-size: 18px;
}
.notfound-box {
  background-color: white;
  border-radius: 16px;
  padding: 50px 24px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
.big-icons {
  margin: 0 0 10px;
  font-size: 54px;
}
h3 {
  margin: 0 0 12px;
  font-size: 26px;
}
.desc {
  margin: 0 0 24px;
  color: #666;
  line-height: 1.7;
}
code {
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #fdf3f3;
  color: #b03a3a;
  font-size: 15px;
}
.home-btn {
  display: inline-block;
  padding: 13px 26px;
  border-radius: 24px;
  background-color: #4a90d9;
  color: white;
  text-decoration: none;
  font-size: 16px;
}
.home-btn:hover {
  background-color: #3a7bc0;
}
</style>
